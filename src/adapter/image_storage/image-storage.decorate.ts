import { Inject } from '@nestjs/common';
import { Services } from 'src/common/define';
const genKey = (fileName: string, viewPort?: string) =>
  `IMAGE:${fileName}:${viewPort ?? 'default'}`;

export function GetImageCacheHandler() {
  const cacheInject = Inject(Services.CACHE);
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    cacheInject(target, 'cacheService');
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cache: ICacheService = this.cacheService;
      if (!cache) return await originalMethod.apply(this, args);
      const [fileName, _, viewPort] = args;
      const key = genKey(fileName, viewPort);
      const imageFetch = await cache.get<FetchImageResponse>(key);
      if (imageFetch)
        return {
          contentType: imageFetch.contentType,
          buffer: Buffer.from(imageFetch.buffer),
        };
      const result = await originalMethod.apply(this, args);
      await cache.set(key, result, 24 * 60 * 60 * 2); // TTL 1 month
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
      const cache: ICacheService = this.cacheService;
      if (!cache) return await originalMethod.apply(this, args);
      const [key] = args;
      const result = await Promise.all([
        originalMethod.apply(this, args),
        cache.delP(`IMAGE:${key}:*`),
      ]).then(async ([result, _]) => result);
      return result;
    };
  };
}
