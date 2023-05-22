import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MessagesController } from './messages/messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import MessageSchema from 'src/models/messages';
import ConversationSchema from 'src/models/conversations';
import { MessagesMiddleware } from './middleware/messages.middleware';
import { MessageProvider } from './messages/messages.provider';
import { Routes } from 'src/common/define';
import { AttachmentsModule } from './attachments/attachments.module';
@Module({
  imports: [
    MongooseModule.forFeature([ConversationSchema]),
    MongooseModule.forFeatureAsync([MessageSchema]),
    AttachmentsModule,
  ],
  controllers: [MessagesController],
  providers: [MessageProvider],
  exports: [MessageProvider],
})
export class MessagesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MessagesMiddleware).forRoutes(Routes.MESSAGES);
  }
}
