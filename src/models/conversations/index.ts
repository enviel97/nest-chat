import { HydratedDocument, Model, Schema } from 'mongoose';
import { ModelName } from 'src/common/define';

export type ConversationDocument = Model<HydratedDocument<Conversation<any>>>;

const ConversationSchema = new Schema<Conversation<any>>(
  {
    participant: { type: String, ref: ModelName.Participant, index: 1 },
    lastMessage: { type: String, ref: ModelName.Message },
    type: { type: String, default: 'direct' },
  },
  { timestamps: true },
);

ConversationSchema.index({ createdAt: 1 });

export { default as CreateConversationDTO } from './dto/ConversationCreate';

export default { name: ModelName.Conversation, schema: ConversationSchema };
