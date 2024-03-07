import { Module } from '@nestjs/common';
import { ImageStorageModule } from 'src/adapter/image_storage/image-storage.module';
import { Services } from 'src/common/define';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy, SessionSerializer } from './utils';
import { PassportModule } from 'src/middleware/authenticate';

const AuthenticateServices = { provide: Services.AUTH, useClass: AuthService };
@Module({
  imports: [UserModule, PassportModule, ImageStorageModule],
  controllers: [AuthController],
  providers: [LocalStrategy, SessionSerializer, AuthenticateServices],
})
export class AuthModule {}
