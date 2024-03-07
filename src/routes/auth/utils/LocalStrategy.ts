import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Services } from 'src/common/define';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Services.AUTH) private readonly authService: IAuthService,
  ) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser({
      email,
      password,
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
