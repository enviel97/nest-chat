import { Cache } from 'cache-manager';
const genKey = (fileName: string, viewPort?: string) =>
  `${fileName}:${viewPort ?? 'default'}`;

export function GetImageCacheHandler() {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cache = this.cacheService as Cache;
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
      await cache.set(key, result, 24 * 60 * 60 * 30); // TTL 1 month
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
      const [result] = await Promise.all([
        originalMethod.apply(this, args),
        this.cacheService.del(genKey(key, 'default')),
        this.cacheService.del(genKey(key, 's')),
        this.cacheService.del(genKey(key, 'sm')),
        this.cacheService.del(genKey(key, 'md')),
        this.cacheService.del(genKey(key, 'lg')),
        this.cacheService.del(genKey(key, 'xl')),
      ]);
      return result;
    };
  };
}
