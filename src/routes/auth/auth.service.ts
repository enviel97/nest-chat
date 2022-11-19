import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Services } from 'src/common/named';
import { compare } from 'src/utils/bcrypt';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUserService,
  ) {}

  async validateUser(account: UserLogin) {
    const { password, ...user } = await this.userService.findUser({
      email: account.email,
      password: true,
    });

    if (!user) {
      throw new BadRequestException('Not found');
    }
    if (!compare(account.password, password)) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return user;
  }
}
