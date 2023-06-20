import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ModelName } from 'src/common/define';

export type FriendRequestDocument = Model<
  HydratedDocument<FriendRequest<Profile<User>>>
>;

@Schema({ timestamps: true })
class SFriendRequest {
  @Prop({ type: String, ref: ModelName.Profile, required: true })
  authorProfile: string;

  @Prop({ type: String, ref: ModelName.Profile, required: true })
  friendProfile: string;

  @Prop({ type: String, required: true })
  authorId: string;

  @Prop({ type: String, required: true })
  friendId: string;

  @Prop({
    type: String,
    default: 'Request',
    enum: ['Request', 'Accept', 'Reject'],
  })
  status: FriendRequestStatus;
}

const FriendRequestSchema = SchemaFactory.createForClass(SFriendRequest);
FriendRequestSchema.index({ friendId: 1, authorId: 1 }, { unique: true });
FriendRequestSchema.index({ _id: 1, status: 1 }, { unique: true });
FriendRequestSchema.index({ friendId: 1, status: 1 });
FriendRequestSchema.index({ authorId: 1, status: 1 });
FriendRequestSchema.index({ authorId: 1, friendId: 1, status: 1 });
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
