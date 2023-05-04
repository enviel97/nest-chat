import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelName } from 'src/common/define';
import type { FriendRequestDocument } from 'src/models/friend-request';
import type { ProfileDocument } from 'src/models/profile';
import type { UserDocument } from 'src/models/users';
import string from 'src/utils/string';
import { UserProfileNotFoundException } from '../exceptions/profile.exception';
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
    const user = await this.profileModel.findOne({ user: userId }).lean();
    if (!user) throw new UserNotfoundException();
    return user;
  }

  private async findBaseAccountId(query: string, user: string) {
    const myself: Profile<User> = await this.profileModel
      .findOne({ user: user })
      .populate('friends', 'user')
      .lean();
    if (!myself) throw new UserProfileNotFoundException();
    const friendIds = [...myself.friends.map((friend) => friend.user), user];
    const containReg = new RegExp(`${query}`, 'i');
    const accounts = await this.userModel
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
            {
              _id: {
                $nin: friendIds.map((id) => new Types.ObjectId(`${id}`)),
              },
            },
          ],
        },
        { _id: { $toString: '$_id' } },
      )
      .find()
      .sort({ email: 1, firstName: 1, lastName: 1 })
      .limit(20)
      .lean();

    const accountIds = accounts.map(string.getId);
    return accountIds;
  }

  async getProfile(userId: string): Promise<Profile<User>> {
    const user = await this.validateUserId(userId);
    return user as Profile<User>;
  }

  async listFriends(userId: string): Promise<ListFriendsResponse> {
    const user = await this.validateUserId(userId);
    const profile = await this.profileModel
      .findById(user.getId())
      .populate({
        path: 'friends',
        select: 'user avatar bio status createdAt updatedAt displayName',
        populate: { path: 'user', select: this.normalProjectionUser },
      })
      .lean();
    return {
      profileId: user.getId(),
      friends: [...profile.friends] as Profile<User>[],
    };
  }

  async searchFriend(user: string, query: string): Promise<Profile<User>[]> {
    const accountIds = await this.findBaseAccountId(query, user);

    const [profiles, friendRequest] = await Promise.all([
      this.profileModel
        .find({ user: { $in: accountIds } }, 'user avatar bio')
        .populate('user', 'firstName lastName email userName')
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

  async updateProfile(
    profileId: string,
    updateProfileDTO: UpdateProfileDTO,
    option: { new?: boolean },
  ): Promise<Profile<User>> {
    const user = await this.validateUserId(profileId);
    const { new: isNew = true } = option ?? { new: true };
    const profile: Profile<User> = await this.profileModel
      .findByIdAndUpdate(
        user.getId(),
        {
          bio: updateProfileDTO.bio,
          avatar: updateProfileDTO.avatar,
          banner: updateProfileDTO.banner,
          displayName: updateProfileDTO.displayName,
        },
        // default true
        { new: isNew },
      )
      .populate('user', this.normalProjectionUser)
      .lean();
    return {
      ...profile,
      user: profile.user as User,
    };
  }

  async changeStatus(
    user: User,
    updateStatusDTO: UpdateStatusDTO,
  ): Promise<UpdateStatusResponse> {
    const profile = await this.validateUserId(user.getId());
    if (profile.status !== updateStatusDTO.status) {
      const updatedProfile: Profile<User> = await this.profileModel
        .findByIdAndUpdate(
          profile.getId(),
          { status: updateStatusDTO.status },
          { new: true },
        )
        .lean();
      return {
        notChange: false,
        profile: { ...updatedProfile, user: user },
      };
    }
    return {
      notChange: profile.status === updateStatusDTO.status,
      profile: {
        ...profile,
        user: user,
      } as Profile<User>,
    };
  }
}
