import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Services } from 'src/common/define';
import { MongooseModule } from '@nestjs/mongoose';
import MessageSchema from 'src/models/messages';
import ConversationSchema from 'src/models/conversations';

@Module({
  imports: [
    MongooseModule.forFeature([ConversationSchema]),
    MongooseModule.forFeatureAsync([MessageSchema]),
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide: Services.MESSAGES,
      useClass: MessagesService,
    },
  ],
  exports: [
    {
      provide: Services.MESSAGES,
      useClass: MessagesService,
    },
  ],
})
export class MessagesModule {}
