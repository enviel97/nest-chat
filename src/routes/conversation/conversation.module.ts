import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName, Services } from 'src/common/define';
import ConversationSchema from 'src/models/conversations';
import UserSchema from 'src/models/users';
import ParticipantSchema from 'src/models/participants';
import MessageSchema from 'src/models/messages';
import { MessagesModule } from '../messages/messages.module';
import { ConversationController, ConversationService } from './direct';
import { ConversationGroupController, ConversationGroupService } from './group';
const ConversationProvider: Provider = {
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
    MongooseModule.forFeature([UserSchema, MessageSchema, ConversationSchema]),
    MongooseModule.forFeatureAsync([ParticipantSchema]),
  ],
  controllers: [ConversationController, ConversationGroupController],
  providers: [ConversationProvider, ConversationGroupProvider],
  exports: [ConversationProvider],
})
export class ConversationModule {}
