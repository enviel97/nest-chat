import { Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Services } from 'src/common/define';
const genKey = (fileName: string, viewPort?: string) =>
  `${fileName}:${viewPort ?? 'default'}`;

export function GetImageCacheHandler() {
  const cacheInject = Inject(Services.CACHE);
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    cacheInject(target, 'cacheService');
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cache: Cache = this.cacheService;
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
  const cacheInject = Inject(Services.CACHE);
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    cacheInject(target, 'cacheService');
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cache: Cache = this.cacheService;
      if (!cache) return await originalMethod.apply(this, args);
      const [key] = args;
      const result = await Promise.all([
        originalMethod.apply(this, args),
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
