import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Routes, Services } from 'src/common/routes';
import { UserDetailDTO } from 'src/models/users';
import { AuthenticateGuard, LocalAuthGuard } from './utils/Guards';
import { Request, Response } from 'express';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}

  @Post('register')
  async register(@Body() user: UserDetailDTO) {
    return instanceToPlain(await this.userService.createUser(user));
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Req() req: Request, @Res() res: Response) {
    return res.json({
      code: HttpStatus.OK,
      message: 'Login success',
      data: req.user,
    });
  }

  @Get('status')
  @UseGuards(AuthenticateGuard)
  status(@Req() req: Request, @Res() res: Response) {
    return res.json({
      code: HttpStatus.OK,
      message: 'Login success',
      data: req.user,
    });
  }

  @Get('logout')
  logout() {}
}
