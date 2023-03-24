import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';

export type FriendDocument = Model<HydratedDocument<FriendRequest<User>>>;

@Schema({ timestamps: true })
class SFriendRequest {
  @Prop({ type: String, ref: ModelName.User })
  author: string;

  @Prop({ type: String, ref: ModelName.User })
  friend: string;

  @Prop({ type: String, default: 'Request' })
  status: FriendRequestStatus;
}

const FriendRequestSchema = SchemaFactory.createForClass(SFriendRequest);
FriendRequestSchema.index({ author: 1, friend: 1 });
FriendRequestSchema.index(
  { status: 1 },
  {
    expireAfterSeconds: 172800, // 2 days
    partialFilterExpression: {
      status: 'Reject',
    },
  },
);

export { default as CreateFriendRequestDTO } from './dto/CreateFriendRequestDTO';
export { default as CreateFriendResponseDTO } from './dto/CreateFriendResponseDTO';

export default {
  name: ModelName.FriendRequest,
  schema: FriendRequestSchema,
};
