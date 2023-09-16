import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Services } from 'src/common/define';
import { compare } from 'src/utils/bcrypt';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IMemberService,
  ) {}

  async validateUser(account: UserLogin) {
    const result = await this.userService.findUser({
      email: account.email,
      password: true,
    });

    if (!result || !compare(account.password, result.password)) {
      throw new BadRequestException('Invalid email or password');
    }

    const { password, ...user } = result;
    return user;
  }
}
