import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Routes, Services } from 'src/common/define';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDetailDTO } from 'src/models/users';
import { AuthenticateGuard, LocalAuthGuard } from './utils/Guards';
import { Response } from 'express';
import { AuthUser } from 'src/utils/decorates';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { BodyDTO } from 'src/utils/valid';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH)
    private readonly authenticateServices: IAuthService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  async register(
    @Res() res: Response,
    @BodyDTO(UserDetailDTO, { upload: 'single' }) dto: UserDetailDTO,
  ) {
    // Force login and set token if can ?
    const newAccount = await this.authenticateServices.registerAccount(dto);
    const { user, profile } = newAccount;
    return res.json({
      code: HttpStatus.OK,
      message: 'Register success',
      data: UserDetailDTO.getUser(user, profile),
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
