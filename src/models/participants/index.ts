import {
  getModelToken,
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';
import string from 'src/utils/string';
import ConversationSchema, { ConversationDocument } from '../conversations';

export type ParticipantDocument = Model<HydratedDocument<Participant<string>>>;

@Schema({ timestamps: true, versionKey: false })
class SParticipant {
  @Prop({ type: [String], ref: ModelName.User, default: [], index: 1 })
  members: User[];

  @Prop({ type: Map, of: String, default: {} })
  roles: ParticipantRole;
}

const ParticipantSchema = SchemaFactory.createForClass(SParticipant);

export default {
  name: ModelName.Participant,
  useFactory: async (conversationModel: ConversationDocument) => {
    const schema = ParticipantSchema;
    schema.post('findOneAndUpdate', async function (doc) {
      const newModel = doc as Participant<User>;
      await conversationModel.findOneAndUpdate(
        { participant: string.getId(newModel) },
        {},
        { updatedAt: newModel.updatedAt ?? new Date() },
      );
    });
    return schema;
  },
  imports: [MongooseModule.forFeature([ConversationSchema])],
  inject: [getModelToken(ModelName.Conversation)],
} as ConfigFactoryModel;
