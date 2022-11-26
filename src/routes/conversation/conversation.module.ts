import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/named';
import ConversationSchema from 'src/models/conversations';
import { UserModule } from '../user/user.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  imports: [UserModule, MongooseModule.forFeature([ConversationSchema])],
  controllers: [ConversationController],
  providers: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationService,
    },
  ],
})
export class ConversationModule {}
