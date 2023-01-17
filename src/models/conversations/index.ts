import { HydratedDocument, Model, Schema } from 'mongoose';
import { ModelName } from 'src/common/define';

export type ConversationDocument = Model<HydratedDocument<Conversation>>;

const ConversationSchema = new Schema<Conversation>(
  {
    author: { type: String, ref: ModelName.User, index: 1 },
    participant: { type: String, ref: ModelName.Participant, index: 1 },
    lastMessage: { type: String, ref: ModelName.Message },
  },
  { timestamps: true },
);

ConversationSchema.index({ createdAt: 1 });
ConversationSchema.index({ author: 1, participant: 1 });

export { default as CreateConversationDTO } from './dto/ConversationCreate';

export default { name: ModelName.Conversation, schema: ConversationSchema };
