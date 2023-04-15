import {
  applyDecorators,
  CacheInterceptor,
  CacheTTL,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = <AuthenticatedRequest>ctx.switchToHttp().getRequest();
    return request.user as IUser;
  },
);

export const SearchCache = (ttl?: number) => {
  return applyDecorators(UseInterceptors(CacheInterceptor), CacheTTL(ttl ?? 5));
};
