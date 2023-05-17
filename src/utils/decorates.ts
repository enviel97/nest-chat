import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { performance } from 'perf_hooks';

export const AuthUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = <AuthenticatedRequest>ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!data) return user;
    if (data === 'id') return user.getId();
    const field = user[data];
    if (!field) throw new ForbiddenException('User property not found');
    return field;
  },
);
/**
 * Show run time of function/feature
 *
 */
export function LogDuration() {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;
      Logger.log(`Executed in ::: ${duration.toFixed(2)}ms`, nameMethod);
      return result;
    };
  };
}

interface ResponseSuccessProps {
  code?: number;
  message?: string;
}
export function ResponseSuccess({ code, message }: ResponseSuccessProps) {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      let result = await originalMethod.apply(this, args);
      return {
        code: code ?? 200,
        data: result,
        message: message ?? 'Request successfully',
      };
    };
  };
}
