import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';

export type ProfileDocument = Model<HydratedDocument<Profile<UserRef>>>;

@Schema({ timestamps: true })
class SProfile {
  @Prop({ type: String })
  displayName: string;

  @Prop({
    type: String,
    ref: ModelName.User,
    unique: true,
    sparse: true,
    index: 1,
  })
  user: string;

  @Prop({ type: String })
  bio: string;

  @Prop({ type: String, default: 'active' })
  status: ProfileStatus;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: String })
  banner: string;

  @Prop({ type: [String], ref: ModelName.Profile, index: 1 })
  blockList: string[];

  @Prop({ type: [String], ref: ModelName.Profile, index: 1 })
  friends: string[];
}

const ProfileSchema = SchemaFactory.createForClass(SProfile);

export { default as UpdateProfileDTO } from './dto/updateProfileDTO';

export default {
  name: ModelName.Profile,
  schema: ProfileSchema,
};
