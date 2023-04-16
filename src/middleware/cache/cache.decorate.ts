import {
  applyDecorators,
  CacheInterceptor,
  CacheTTL,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CacheWrapper } from './cache.utils';

export const SearchCache = (ttl?: number) => {
  return applyDecorators(UseInterceptors(CacheInterceptor), CacheTTL(ttl ?? 5));
};

interface ValidationCacheProps {
  ttl?: number;
  nameValidate: string;
  keyIndex: number;
}
export const ValidationCache = ({
  ttl = 24 * 60 * 60 * 1000,
  nameValidate,
  keyIndex,
}: ValidationCacheProps) => {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        const cache = CacheWrapper(this.cache);
        if (!cache) throw new Error('Cache store is empty');
        const key = args.at(0);
        const validateKey = `Validate:${nameValidate}:${key}`;
        const cacheData = await cache.get(validateKey);
        if (cacheData) return cacheData;
        const value = await originalMethod.call(this, ...args);
        await cache.set(validateKey, value, ttl); // TTL in once day
        return value;
      } catch (error) {
        Logger.error(error, ['Validate cache error']);
        return await originalMethod.call(this, ...args);
      }
    };
  };
};
