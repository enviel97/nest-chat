import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';

export type ConversationDocument = Model<HydratedDocument<Conversation<any>>>;
enum ConversationType {
  direct = 'direct',
  group = 'group',
}

@Schema()
class SParticipant {
  @Prop({
    type: [String],
    ref: ModelName.User,
    default: [],
    unique: true,
    index: 1,
  })
  members: User[];

  @Prop({ type: Map, of: String, default: {} })
  roles: ParticipantRole;
}

const ParticipantSchema = SchemaFactory.createForClass(SParticipant);

@Schema({ timestamps: true })
class SConversation {
  @Prop()
  name: string;

  @Prop({ default: 'direct', enum: ConversationType })
  type: ConversationType;

  @Prop({ type: ParticipantSchema })
  participant: Participant<User>;

  @Prop({ type: String, ref: ModelName.Message })
  lastMessage: Message;
}

const ConversationSchema = SchemaFactory.createForClass(SConversation);
ConversationSchema.index({ createdAt: 1 });
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ type: 1, ['participant.members']: 1 });

export { default as CreateConversationDTO } from './dto/ConversationCreate';

export default {
  name: ModelName.Conversation,
  schema: ConversationSchema,
};
