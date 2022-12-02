import { HydratedDocument, Model, Schema } from 'mongoose';
import { ModelName } from 'src/common/define';

export type MessageDocument = Model<HydratedDocument<Message>>;

const MessageSchema = new Schema<Message>(
  {
    conversationId: { type: String, index: true },
    content: { type: String },
    author: { type: String, ref: ModelName.User },
  },
  { timestamps: true },
);

MessageSchema.index({ createdAt: 1 });

export { default as CreateMessageDTO } from './dto/CreateMessagesDTO';

export default { name: ModelName.Message, schema: MessageSchema };
