import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';

export type ConversationDocument = Model<HydratedDocument<Conversation<any>>>;

// const ConversationSchema = new Schema<Conversation<any>>(
//   {
//     participant: { type: String, ref: ModelName.Participant, index: 1 },
//     lastMessage: { type: String, ref: ModelName.Message },
//     name: { type: String, required: true },
//     type: { type: String, default: 'direct' },
//   },
//   { timestamps: true },
// );

// ConversationSchema.index({ createdAt: 1 });

@Schema({ timestamps: true })
class SConversation {
  @Prop()
  name: string;

  @Prop({ default: 'direct' })
  type: ConversationType;

  @Prop({ type: String, required: true, ref: ModelName.Participant, index: 1 })
  participant: Participant<User>;

  @Prop({ type: String, ref: ModelName.Message })
  lastMessage: Message;
}

const ConversationSchema = SchemaFactory.createForClass(SConversation);
ConversationSchema.index({ createdAt: 1 });

export { default as CreateConversationDTO } from './dto/ConversationCreate';

export default {
  name: ModelName.Conversation,
  schema: ConversationSchema,
};
