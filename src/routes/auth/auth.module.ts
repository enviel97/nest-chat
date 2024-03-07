import { Module } from '@nestjs/common';
import { ImageStorageModule } from 'src/adapter/image_storage/image-storage.module';
import { Services } from 'src/common/define';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './utils/LocalStrategy';
import { SessionSerializer } from './utils/SessionSerializer';
import { PassportModule } from 'src/middleware/passport';

const AuthenticateServices = { provide: Services.AUTH, useClass: AuthService };
@Module({
  imports: [UserModule, PassportModule, ImageStorageModule],
  controllers: [AuthController],
  providers: [LocalStrategy, SessionSerializer, AuthenticateServices],
})
export class AuthModule {}
