import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Services } from 'src/common/routes';
import { compare } from 'src/utils/bcrypt';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUserService,
  ) {}

  async validateUser(account: Account) {
    const user = await this.userService.findUser({
      email: account.email,
      password: true,
    });
    if (!user) {
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    }

    return compare(account.password, user.password);
  }
}
