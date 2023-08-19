import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { applyDecorators, UseInterceptors } from '@nestjs/common';

export const SearchCache = (ttl?: number) => {
  return applyDecorators(UseInterceptors(CacheInterceptor), CacheTTL(ttl ?? 5));
};
