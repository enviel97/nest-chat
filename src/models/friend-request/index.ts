import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';

export type FriendRequestDocument = Model<
  HydratedDocument<FriendRequest<Profile<User>>>
>;

@Schema({ timestamps: true })
class SFriendRequest {
  @Prop({ type: String, ref: ModelName.Profile })
  authorProfile: string;

  @Prop({ type: String, ref: ModelName.Profile })
  friendProfile: string;

  @Prop({ type: String, index: 1 })
  authorId: string;

  @Prop({ type: String, index: 1 })
  friendId: string;

  @Prop({ type: String, default: 'Request' })
  status: FriendRequestStatus;
}

const FriendRequestSchema = SchemaFactory.createForClass(SFriendRequest);
FriendRequestSchema.index({ authorProfile: 1, friendProfile: 1 });
FriendRequestSchema.index({ friendId: 1, status: 1 });
FriendRequestSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 5, // 5s
    partialFilterExpression: {
      status: 'Accept',
    },
  },
);
FriendRequestSchema.index(
  { createdAt: -1 },
  {
    expireAfterSeconds: 5, // 5s
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
