import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import type { HydratedDocument, Model } from 'mongoose';
import { Schema } from 'mongoose';
import { ModelName, Services } from 'src/common/define';
import ConversationSchema from '../conversations';
import type { ConversationDocument } from '../conversations';

export type MessageDocument = Model<HydratedDocument<Message>>;

const MessageSchema = new Schema<Message>(
  {
    conversationId: { type: String, index: true },
    content: { type: String },
    author: { type: String, ref: ModelName.User },
    action: { type: String, default: 'New' },
  },
  { timestamps: true },
);

MessageSchema.index({ createdAt: 1 }, { expires: '1y' });

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
      if (['New', 'Seen'].includes(doc.action)) {
        await Promise.all([
          conversationModel
            .findByIdAndUpdate(doc.conversationId, {
              lastMessage: doc.getId(),
            })
            .lean(),
          // update full conversation assets
          cache.update('conversation', { lastMessage: doc }),
        ]).catch((error) => {
          next(error);
        });
      }
    });

    schema.pre('findOneAndUpdate', async function (next) {
      const doc = this.getUpdate();
      // TODO::
      console.log(doc);
    });

    return schema;
  },
  imports: [MongooseModule.forFeature([ConversationSchema])],
  inject: [getModelToken(ModelName.Conversation), Services.CACHE],
} as ConfigFactoryModel;
