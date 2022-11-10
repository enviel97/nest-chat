import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService implements IAuthService {
  validateUser() {
    throw new Error('Method not implemented.');
  }
}
