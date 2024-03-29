import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { Services } from 'src/common/define';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(Services.USERS)
    private readonly userService: IMemberService,
  ) {
    super();
  }

  serializeUser(user: any, done: Function) {
    console.log({ serializeUser: user });
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    console.log({ deserializeUser: payload });
    const userDb = await this.userService.findUser({ id: payload.id });
    done(null, userDb ?? null);
  }
}
