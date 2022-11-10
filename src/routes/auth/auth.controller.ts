import { Controller, Inject } from '@nestjs/common';
import { Routes, Services } from 'src/common/routes';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(@Inject(Services.AUTH) private authService: IAuthService) {}
}
