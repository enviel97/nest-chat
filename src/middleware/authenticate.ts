import { PassportModule as passport } from '@nestjs/passport';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

export const PassportModule = passport.register({
  session: true,
});

@Injectable()
export class AuthenticateGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}
