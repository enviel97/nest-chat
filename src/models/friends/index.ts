import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';

export type FriendDocument = Model<HydratedDocument<Friend<UserRef>>>;

@Schema({ timestamps: true, _id: true })
class SFriend {
  @Prop({ type: String, ref: ModelName.User })
  author: string;

  @Prop({ type: String, ref: ModelName.User })
  friend: string;

  @Prop({ type: String, default: 'Request' })
  status: ActionStatus;
}

const FriendSchema = SchemaFactory.createForClass(SFriend);
FriendSchema.index({ author: 1, friend: 1 });

export { default as CreateFriendRequestDTO } from './dto/CreateFriendRequestDTO';
export { default as CreateFriendResponseDTO } from './dto/CreateFriendResponseDTO';

export default {
  name: ModelName.Friend,
  schema: FriendSchema,
};
