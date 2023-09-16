import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/define';
import ConversationSchema from 'src/models/conversations';
import UserSchema from 'src/models/users';
import { ConversationController, ConversationService } from './direct';
import { ConversationGroupController, ConversationGroupService } from './group';
import { MessagesModule } from '../messages/messages.module';
const ConversationDirectProvider: Provider = {
  provide: Services.CONVERSATIONS,
  useClass: ConversationService,
};
const ConversationGroupProvider: Provider = {
  provide: Services.PARTICIPANT,
  useClass: ConversationGroupService,
};
@Module({
  imports: [
    MessagesModule,
    MongooseModule.forFeature([UserSchema, ConversationSchema]),
  ],
  controllers: [ConversationController, ConversationGroupController],
  providers: [ConversationDirectProvider, ConversationGroupProvider],
  exports: [ConversationDirectProvider],
})
export class ConversationModule {}
