import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { FriendRequestDocument } from 'src/models/friend-request';
import { ProfileDocument } from 'src/models/profile';
import string from 'src/utils/string';
import {
  FriendNotFoundException,
  FriendRequestAcceptedException,
  FriendRequestException,
  FriendRequestPendingException,
  FriendRequestRejectException,
} from '../exceptions/friend-request.exception';
import { UserNotfoundException } from '../exceptions/user.exception';
import {
  normalProjectionUser,
  requestFriendListPopulate,
} from './friend-request.populate';

@Injectable()
export class FriendRequestService implements IFriendRequestService {
  constructor(
    @InjectModel(ModelName.FriendRequest)
    private readonly friendModel: FriendRequestDocument,
    @InjectModel(ModelName.Profile)
    private readonly profileModel: ProfileDocument,
  ) {}

  private async validateFriendByUser(authorId: string, userId: string) {
    const [friendRelationships, author, newFriend] = await Promise.all([
      this.friendModel
        .find({
          $or: [
            { $and: [{ authorId: authorId }, { friendId: userId }] },
            { $and: [{ authorId: userId }, { friendId: authorId }] },
          ],
        })
        .lean(),
      this.profileModel
        .findOne({ user: authorId })
        .populate('user', normalProjectionUser)
        .lean(),
      this.profileModel
        .findOne({ user: userId })
        .populate('user', normalProjectionUser)
        .lean(),
    ]);
    if (!author) throw new BadRequestException(`Author not found`);
    if (!newFriend) throw new BadRequestException(`User not found`);

    return {
      author: author as Profile<User>,
      friend: newFriend as Profile<User>,
      relationship: friendRelationships.at(0),
    };
  }

  async create(
    friendId: string,
    userId: string,
  ): Promise<FriendRequest<Profile<User>>> {
    const { author, friend, relationship } = await this.validateFriendByUser(
      userId,
      friendId,
    );
    if (relationship) throw new FriendRequestException();

    const friendRequest = await this.friendModel.create({
      authorId: userId,
      authorProfile: author.getId(),
      friendId: friendId,
      friendProfile: friend.getId(),
      status: 'Request',
    });

    return {
      ...friendRequest.toObject(),
      authorProfile: author,
      friendProfile: friend,
    };
  }

  private async validateFriendById(friendRequestId: string) {
    const relationship = await this.friendModel.findById(friendRequestId);
    if (!relationship) throw new FriendNotFoundException();
    const [profileAuthor, profileUser] = await Promise.all([
      this.profileModel
        .findOne({ user: relationship.authorProfile })
        .populate('user', normalProjectionUser),
      this.profileModel
        .findOne({ user: relationship.friendProfile })
        .populate('user', normalProjectionUser),
    ]);
    if (!profileAuthor) throw new BadRequestException(`Author not found`);
    if (!profileUser) throw new BadRequestException(`User not found`);
    return {
      author: profileAuthor,
      relationship,
      friend: profileUser,
    };
  }

  async cancel(friendRequestId: string): Promise<CancelFriendRequest> {
    const { relationship, author, friend } = await this.validateFriendById(
      friendRequestId,
    );
    switch (relationship.status) {
      case 'Accept':
        throw new FriendRequestAcceptedException();
      case 'Reject':
        throw new FriendRequestRejectException();
      case 'Request': {
        await relationship.delete();
        break;
      }
    }
    return {
      friend: string.getId(friend.user),
      author: string.getId(author.user),
    };
  }

  async response(
    friendId: string,
    friendRequestId: string,
    status: 'Accept' | 'Reject',
  ): Promise<AddFriendRequest> {
    const { relationship, friend, author } = await this.validateFriendById(
      friendRequestId,
    );
    if (relationship.status !== 'Request') {
      throw new FriendRequestPendingException();
    }
    if (string.getId(friend.user) !== friendId) {
      throw new FriendRequestException();
    }
    switch (status) {
      case 'Accept': {
        const authorId = string.getId(author);
        const friendId = string.getId(friend);
        const [user, newFriend] = await Promise.all<Profile<User>>([
          author.update({ $push: { friends: friendId } }, { new: true }).lean(),
          friend.update({ $push: { friends: authorId } }, { new: true }).lean(),
          relationship.update({ status: 'Accept' }).lean(),
        ]);
        return {
          author: user,
          friend: newFriend,
          status: 'Accept',
        };
      }
      case 'Reject': {
        await relationship.update({ status: 'Reject' }, { new: true }).lean();
        return {
          author: author.toObject(),
          friend: friend.toObject(),
          status: 'Reject',
        };
      }
    }
  }

  async listRequest(userId: string): Promise<FriendRequest<Profile<User>>[]> {
    const [user, relationship] = await Promise.all([
      this.profileModel.findOne({ user: userId }, 'user bio avatar').lean(),
      this.friendModel
        .find(
          { friendId: userId, status: 'Request' },
          'createdAt authorId authorProfile updatedAt',
          {
            skip: 0,
            limit: 10,
            populate: requestFriendListPopulate,
          },
        )
        .lean(),
    ]);
    if (!user) throw new UserNotfoundException();
    return relationship;
  }
}
