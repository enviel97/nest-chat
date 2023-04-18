import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/define';
import ConversationSchema from 'src/models/conversations';
import UserSchema from 'src/models/users';
import ParticipantSchema from 'src/models/participants';
import MessageSchema from 'src/models/messages';
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
    MongooseModule.forFeature([UserSchema, ConversationSchema]),
    MongooseModule.forFeatureAsync([ParticipantSchema, MessageSchema]),
  ],
  controllers: [ConversationController, ConversationGroupController],
  providers: [ConversationProvider, ConversationGroupProvider],
  exports: [ConversationProvider],
})
export class ConversationModule {}
