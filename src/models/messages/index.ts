import { HydratedDocument, Schema } from 'mongoose';
import { ModelName } from 'src/common/named';

export type MessageDocument = HydratedDocument<Message>;

const MessageSchema = new Schema<Message>(
  {
    conversationId: { type: String, index: true },
    content: { type: String },
    author: { type: String, ref: ModelName.User },
  },
  { timestamps: true },
);

export default { name: ModelName.Message, schema: MessageSchema };
