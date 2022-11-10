import { Module } from '@nestjs/common';
import { Services } from 'src/common/routes';
import { UserService } from './user.service';

@Module({
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
