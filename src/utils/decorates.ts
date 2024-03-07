import {
  applyDecorators,
  Controller,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { performance } from 'perf_hooks';
import { AuthenticateGuard } from 'src/middleware/authenticate';

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
export function LogDuration(keyIndex?: number) {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;
      Logger.log(`Executed in ::: ${duration.toFixed(2)}ms`, nameMethod);
      keyIndex &&
        args.at(keyIndex) &&
        Logger.log(
          `Custom watch variable:\n\t${args.at(keyIndex)}`,
          nameMethod,
        );
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
/**
 *
 * @param controller define in src/common/define
 * @returns
 */
export function ProtectController(controller: string) {
  return applyDecorators(Controller(controller), UseGuards(AuthenticateGuard));
}
