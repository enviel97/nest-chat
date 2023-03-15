import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services } from 'src/common/define';
import ConversationSchema from 'src/models/conversations';
import UserSchema from 'src/models/users';
import ParticipantSchema from 'src/models/participants';
import MessageSchema from 'src/models/messages';
import { MessagesModule } from '../messages/messages.module';
import { ConversationController } from './controllers/conversation.controller';
import { ConversationService } from './services/conversation.service';
import { ConversationParticipantController } from './controllers/conversationParticipant.controller';
import { ConversationParticipantService } from './services/conversationParticipant.service';

@Module({
  imports: [
    MessagesModule,
    MongooseModule.forFeature([
      ConversationSchema,
      UserSchema,
      ParticipantSchema,
      MessageSchema,
    ]),
  ],
  controllers: [ConversationController, ConversationParticipantController],
  providers: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationService,
    },
    {
      provide: Services.PARTICIPANT,
      useClass: ConversationParticipantService,
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
