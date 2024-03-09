import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Services } from 'src/common/define';
import string from 'src/utils/string';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(Services.USERS)
    private readonly userService: IMemberService,
  ) {
    super();
  }

  // Store user in redis here
  serializeUser(user: any, done: Function) {
    done(null, { ...user, from: new Date().toISOString() });
  }

  // Find user by id to confirm login
  async deserializeUser(payload: any, done: Function) {
    const userDb = await this.userService.findUser({
      id: string.getId(payload),
    });
    done(null, userDb);
  }
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Services.AUTH) private readonly authService: IAuthService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    return await this.authService.validateUser({
      email,
      password,
    });
  }
}
