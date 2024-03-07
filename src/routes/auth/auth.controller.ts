import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { Routes, Services } from 'src/common/define';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDetailDTO } from 'src/models/users';
import { LocalAuthGuard } from './utils';
import { Response } from 'express';
import { AuthUser } from 'src/utils/decorates';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { BodyDTO } from 'src/utils/valid';
import { AuthenticateGuard } from 'src/middleware/authenticate';
import { NotAcceptableException } from '@nestjs/common/exceptions';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH)
    private readonly authenticateServices: IAuthService,
  ) {}
  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  async register(
    @Req() req: Request,
    @Res() res: Response,
    @BodyDTO(UserDetailDTO, { upload: 'single' }) dto: UserDetailDTO,
  ) {
    const registerPlain = await this.authenticateServices.registerAccount(dto);
    const { user, profile } = registerPlain;
    const newAccount = UserDetailDTO.getUser(user, profile);
    req.login(user, { session: true }, (error) => {
      if (!error) return;
      Logger.error(error);
      throw new NotAcceptableException('Login failure', error);
    });
    return res.json({
      code: HttpStatus.CREATED,
      message: 'Register success',
      data: newAccount,
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
  logout(@Req() req: Request) {
    req.logout({ keepSessionInfo: false }, (error) => {
      if (!error) return;
      Logger.error('Logout failure', error);
      throw new NotAcceptableException('Logout occurs failure');
    });
    return {
      code: HttpStatus.ACCEPTED,
      message: 'Logout success.',
    };
  }
}
