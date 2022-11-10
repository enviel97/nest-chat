import { Module } from '@nestjs/common';
import environment from './middleware/environment';

import mongoose from './middleware/mongoose';
import { AuthModule } from './routes/auth/auth.module';
import { UserModule } from './routes/user/user.module';

@Module({
  imports: [environment, mongoose, AuthModule, UserModule],
})
export class AppModule {}
