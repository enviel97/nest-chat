import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Routes, Services } from 'src/common/routes';
import { UserDTO, UserLoginDTO } from 'src/models/users/user.dto';
import { LocalAuthGuard } from './utils/Guards';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}

  @Post('register')
  async register(@Body() user: UserDTO) {
    return instanceToPlain(await this.userService.createUser(user));
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() login: UserLoginDTO) {
    // return this.authService.validateUser(login);
  }

  @Get('status')
  status() {}

  @Get('logout')
  logout() {}
}
