import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import type { HydratedDocument, Model } from 'mongoose';
import { Schema } from 'mongoose';
import { ModelName, Services } from 'src/common/define';
import ConversationSchema from '../conversations';
import type { ConversationDocument } from '../conversations';
import { CacheModel } from 'src/common/cache';
import getCacheModelKey from 'src/middleware/cache/utils/getCacheModelKey';

export type MessageDocument = Model<HydratedDocument<Message>>;

const MessageAttachment = new Schema<MessageAttachment>(
  {
    downloadLink: { type: String, default: '' },
    publicId: { type: String, required: true },
    type: { type: String, required: true },
    originName: { type: String },
    size: { type: Number },
  },
  { timestamps: true },
);

const MessageSchema = new Schema<Message>(
  {
    conversationId: { type: String, index: true },
    content: { type: String, trim: true },
    author: { type: String, ref: ModelName.User },
    action: { type: String, default: 'New' },
    attachments: { type: [MessageAttachment] },
  },
  { timestamps: true },
);

MessageSchema.index({ createdAt: 1 }, { expires: '1y' });
MessageSchema.index({ conversationId: 1, action: 1 });

export { default as CreateMessageDTO } from './dto/CreateMessagesDTO';

export default {
  name: ModelName.Message,
  useFactory: async (
    conversationModel: ConversationDocument,
    cache: ICacheService,
  ) => {
    const schema = MessageSchema;
    schema.pre('save', async function (next) {
      const doc = this;
      if (!['New', 'Seen'].includes(doc.action)) return;
      await Promise.all([
        conversationModel
          .findByIdAndUpdate(doc.conversationId, {
            lastMessage: doc.getId(),
          })
          .lean(),
        // update full conversation assets
        cache.update(
          getCacheModelKey(CacheModel.MESSAGE_CONVERSATION, doc.conversationId),
          { lastMessage: doc },
        ),
      ]).catch((error) => {
        console.log({ error });
        next(error);
      });
    });

    return schema;
  },
  imports: [MongooseModule.forFeature([ConversationSchema])],
  inject: [getModelToken(ModelName.Conversation), Services.CACHE],
} as ConfigFactoryModel;
