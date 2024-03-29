import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { isArray, mergeWith } from 'lodash';

@Injectable()
export class CacheService implements ICacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache, //
  ) {}

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    return await this.cache.set(key, value, { ttl } as any);
  }
  async get<T = any>(key: string): Promise<T> {
    return await this.cache.get<T>(key);
  }

  async del(key: string): Promise<void> {
    return await this.cache.del(key);
  }

  async delP(pattern: string): Promise<void> {
    const keys = await this.cache.store.keys(pattern);
    if (keys.length === 0) {
      Logger.warn(
        `Don't find any key like ${pattern}`,
        'Del multi cache by pattern',
      );
      return;
    }
    Logger.log(
      `Del multi cache by pattern ${pattern} - size: ${keys.length}`,
      `Redis Del Pattern`,
    );
    await this.cache.store.mdel(...keys);
  }

  async update<T = any>(
    key: string,
    value: T,
    ttl?: number,
    shallow?: boolean,
  ): Promise<boolean> {
    const data = await this.get<T>(key);
    if (!data) return false;
    const merged = shallow
      ? { ...data, ...value }
      : mergeWith(data, value, (src, target) => {
          if (isArray(src)) return target;
        });
    await this.set<T>(key, merged, ttl);
    return true;
  }
}
