import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';

export type ProfileDocument = Model<HydratedDocument<Profile<UserRef>>>;

@Schema({ timestamps: true })
class SProfile {
  @Prop({ type: String, ref: ModelName.User, index: true, unique: true })
  user: string;

  @Prop({ type: String })
  bio: string;

  @Prop({ type: String, default: 'active' })
  status: ProfileStatus;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: String, ref: ModelName.Profile, index: true })
  blockList: string[];

  @Prop({ type: String, ref: ModelName.Profile, index: true })
  friends: string[];
}

const ProfileSchema = SchemaFactory.createForClass(SProfile);

export default {
  name: ModelName.Profile,
  schema: ProfileSchema,
};
