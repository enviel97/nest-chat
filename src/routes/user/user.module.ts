import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/define';
import UserSchema from 'src/models/users';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([UserSchema])],
  controllers: [UserController],
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
