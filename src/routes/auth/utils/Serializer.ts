import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { Services } from 'src/common/routes';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(Services.AUTH) private readonly authService: IAuthService,
  ) {
    super();
  }

  serializeUser(user: User, done: Function) {
    console.log('serialize');
    done(null, user);
  }

  async deserializeUser(payload: User, done: Function) {
    const userDb = await this.authService.validateUser({ id: payload.id });
    done(null, userDb ?? null);
  }
}
