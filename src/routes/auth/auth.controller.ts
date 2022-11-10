import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { Routes, Services } from 'src/common/routes';
import { UserDTO } from 'src/models/user.model';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}

  @Post('register')
  register(@Body() user: UserDTO) {
    this.userService.createUser(user);
  }

  @Post('login')
  login() {}

  @Get('status')
  status() {}

  @Get('logout')
  logout() {}
}
