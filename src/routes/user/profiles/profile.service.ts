import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelName } from 'src/common/define';
import { FriendRequestDocument } from 'src/models/friend-request';
import { ProfileDocument } from 'src/models/profile';
import { UserDocument } from 'src/models/users';
import string from 'src/utils/string';
import { UserNotfoundException } from '../exceptions/user.exception';

@Injectable()
export class ProfileService implements IProfileService {
  private normalProjectionUser: string = 'email firstName lastName';

  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
    @InjectModel(ModelName.Profile)
    private readonly profileModel: ProfileDocument,
    @InjectModel(ModelName.FriendRequest)
    private readonly friendRequestModel: FriendRequestDocument,
  ) {}

  private async validateUserId(userId: string) {
    const user = await this.profileModel.findOne({ user: userId });
    if (!user) throw new UserNotfoundException();
    return { user };
  }

  async getProfile(userId: string): Promise<Profile<User>> {
    const { user } = await this.validateUserId(userId);
    return user.toObject();
  }

  async listFriends(userId: string): Promise<Profile<User>[]> {
    const { user } = await this.validateUserId(userId);
    const profile = await user.populate({
      path: 'friends',
      populate: { path: 'user', select: this.normalProjectionUser },
    });
    return [...profile.friends] as Profile<User>[];
  }

  async searchFriend(user: string, query: string): Promise<Profile<User>[]> {
    const containReg = new RegExp(`${query}`, 'i');
    const account = await this.userModel
      .find(
        {
          $and: [
            {
              $or: [
                { email: { $regex: containReg } },
                { firstName: { $regex: containReg } },
                { lastName: { $regex: containReg } },
              ],
            },
            { _id: { $ne: new Types.ObjectId(user) } },
          ],
        },
        { _id: 1 },
      )
      .sort({ email: 1, firstName: 1, lastName: 1 })
      .limit(20)
      .lean();
    if (!account) return [];
    const accountIds = account.map(string.getId);
    const [profiles, friendRequest] = await Promise.all([
      this.profileModel
        .find({ user: { $in: accountIds } }, 'user avatar bio')
        .populate('user', 'firstName lastName email')
        .lean(),
      this.friendRequestModel
        .find({
          $or: [
            {
              authorId: user,
              friendId: { $in: accountIds },
              status: 'Request',
            },
            {
              friendId: user,
              authorId: { $in: accountIds },
              status: 'Request',
            },
          ],
        })
        .populate('friendProfile')
        .lean(),
    ]);

    return profiles.filter((profile) => {
      const file = friendRequest.find((req) => {
        return (
          req.authorProfile.getId() === profile.getId() ||
          req.friendProfile.getId() === profile.getId()
        );
      });
      return !file;
    }) as Profile<User>[];
  }
}
