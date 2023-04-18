import {
  applyDecorators,
  CacheInterceptor,
  CacheTTL,
  UseInterceptors,
} from '@nestjs/common';

export const SearchCache = (ttl?: number) => {
  return applyDecorators(UseInterceptors(CacheInterceptor), CacheTTL(ttl ?? 5));
};
