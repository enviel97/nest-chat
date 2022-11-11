import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/routes';
import { UserSchema } from 'src/models/users';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([UserSchema])],
  providers: [
    {
      provide: Services.USERS,
      useClass: UserService,
    },
  ],
  exports: [
    {
      provide: Services.USERS,
      useClass: UserService,
    },
  ],
})
export class UserModule {}
