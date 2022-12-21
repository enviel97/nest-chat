import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/define';
import ConversationSchema from 'src/models/conversations';
import { MessagesModule } from '../messages/messages.module';
import { UserModule } from '../user/user.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    UserModule,
    MessagesModule,
    MongooseModule.forFeature([ConversationSchema]),
  ],
  controllers: [ConversationController],
  providers: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationService,
    },
  ],
  exports: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationService,
    },
  ],
})
export class ConversationModule {}
