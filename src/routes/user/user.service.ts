import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService implements IUserService {
  createUser(user: User) {
    console.log(user);
  }
}
