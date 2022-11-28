import { HydratedDocument, Model, Schema } from 'mongoose';
import { ModelName } from 'src/common/named';

export type ConversationDocument = Model<HydratedDocument<Conversation>>;

const ConversationSchema = new Schema<Conversation>(
  {
    author: { type: String, ref: ModelName.User, index: true },
    participant: { type: String, ref: ModelName.User, index: true },
    lastMessage: { type: String, ref: ModelName.Message },
  },
  { timestamps: true },
);

export { default as CreateConversationDTO } from './dto/ConversationCreate';

export default { name: ModelName.Conversation, schema: ConversationSchema };
