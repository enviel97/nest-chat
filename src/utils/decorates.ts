import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = <AuthenticatedRequest>ctx.switchToHttp().getRequest();
    return request.user as IUser;
  },
);

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
