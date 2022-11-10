import { Module } from '@nestjs/common';
import { Services } from 'src/common/routes';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    {
      provide: Services.AUTH,
      useClass: AuthService,
    },
  ],
})
export class AuthModule {}
