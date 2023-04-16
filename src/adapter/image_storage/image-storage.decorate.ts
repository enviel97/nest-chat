import { Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheWrapper } from 'src/middleware/cache/cache.utils';
const genKey = (fileName: string, viewPort?: string) =>
  `${fileName}:${viewPort ?? 'default'}`;

export function GetImageCacheHandler() {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cache = CacheWrapper(this.cacheService);
      if (!cache) return await originalMethod.apply(this, args);
      const [fileName, viewPort] = args;
      const key = genKey(fileName, viewPort);
      const imageFetch = await cache.get<FetchImageResponse>(key);
      if (imageFetch)
        return {
          contentType: imageFetch.contentType,
          buffer: Buffer.from(imageFetch.buffer),
        };
      const result = await originalMethod.apply(this, args);
      await cache.set(key, result, { ttl: 24 * 60 * 60 * 30 * 1000 } as any); // TTL 1 month
      return result;
    };
  };
}

export function DeleteImageCacheHandler() {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cache = this.cacheService as Cache;
      if (!cache) return await originalMethod.apply(this, args);
      const [key] = args;
      const result = await Promise.all([
        originalMethod.apply(this, args),
        // this.cacheService.del(genKey(key, 'default')),
        // this.cacheService.del(genKey(key, 's')),
        // this.cacheService.del(genKey(key, 'sm')),
        // this.cacheService.del(genKey(key, 'md')),
        // this.cacheService.del(genKey(key, 'lg')),
        // this.cacheService.del(genKey(key, 'xl')),
        cache.store.keys(`${key}:*`),
      ]).then(async ([result, keys]) => {
        if (keys.length === 0) {
          Logger.warn(
            `Don't find any key like ${key}:*`,
            'Del multi cache by pattern',
          );
        }
        await cache.store.mdel(...keys);
        return result;
      });
      return result;
    };
  };
}
