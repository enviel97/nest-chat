import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Routes, Services } from 'src/common/define';
import { UserDetailDTO } from 'src/models/users';
import { AuthenticateGuard, LocalAuthGuard } from './utils/Guards';
import { Response } from 'express';
import { AuthUser } from 'src/utils/decorates';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(@Inject(Services.USERS) private userService: IMemberService) {}

  @Post('register')
  async register(@Res() res: Response, @Body() user: UserDetailDTO) {
    const data = instanceToPlain(await this.userService.createUser(user));
    return res.json({
      code: HttpStatus.OK,
      message: 'Register success',
      data: data,
    });
  }

  @Throttle(5, 10)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@AuthUser() user: User, @Res() res: Response) {
    return res.json({
      code: HttpStatus.OK,
      message: 'Login success',
      data: user,
    });
  }

  @Get('status')
  @SkipThrottle()
  @UseGuards(AuthenticateGuard)
  status(@AuthUser() user: User, @Res() res: Response) {
    return res.json({
      code: HttpStatus.OK,
      message: 'Login success',
      data: user,
    });
  }

  @Get('logout')
  logout() {}
}
