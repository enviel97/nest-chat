import { Inject } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { Services } from 'src/common/routes';

export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(Services.AUTH) private readonly userService: IUserService,
  ) {
    super();
  }

  async serializeUser(user: User, done: Function) {
    done(null, user);
  }
  async deserializeUser(payload: IUser, done: Function) {
    const userDb = await this.userService.findUser({ id: payload.id });
    return userDb ? done(null, userDb) : done(null, null);
  }
}
