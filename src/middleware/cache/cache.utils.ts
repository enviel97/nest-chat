import { Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
export const CacheWrapper = (cache?: Cache) => {
  if (!cache) return;
  return Object.freeze({
    async set<T extends any>(key: string, value: T, ttl?: number) {
      return await cache.set(key, value, ttl);
    },
    async get<T>(key: string) {
      return await cache.get<T>(key);
    },
    async del(key: string) {
      return await cache.del(key);
    },
    async delP(pattern: string) {
      const keys = await cache.store.keys(pattern);
      if (keys.length === 0) {
        Logger.warn(
          `Don't find any key like ${pattern}`,
          'Del multi cache by pattern',
        );
        return;
      }
      cache.store.mdel(...keys);
    },
  });
};
