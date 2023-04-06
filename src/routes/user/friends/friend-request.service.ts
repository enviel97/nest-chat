import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelName } from 'src/common/define';
import { FriendRequestDocument } from 'src/models/friend-request';
import { ProfileDocument } from 'src/models/profile';
import string from 'src/utils/string';
import {
  FriendNotFoundException,
  FriendRequestAcceptedException,
  FriendRequestException,
  FriendRequestExitedException,
  FriendRequestPendingException,
  FriendRequestPermissionException,
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
    if (author.friends.includes(string.getId(newFriend))) {
      throw new BadRequestException(`You two are already friends`);
    }
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
    const relationship = await this.friendModel
      .findById(friendRequestId)
      .lean();
    if (!relationship) throw new FriendNotFoundException();

    const [profileAuthor, profileUser] = await Promise.all([
      this.profileModel
        .findById(relationship.authorProfile)
        .populate('user', normalProjectionUser),
      this.profileModel
        .findById(relationship.friendProfile)
        .populate('user', normalProjectionUser),
    ]);
    if (!profileAuthor) throw new BadRequestException(`Author not found`);
    if (!profileUser) throw new BadRequestException(`User not found`);
    return {
      author: profileAuthor,
      friend: profileUser,
      relationship,
    };
  }

  async response(
    friendRequestId: string,
    friendAccountId: string,
    status: 'Accept' | 'Reject',
  ): Promise<FriendRequest<Profile<User>>> {
    const { relationship, friend, author } = await this.validateFriendById(
      friendRequestId,
    );
    if (relationship.friendId !== friendAccountId) {
      throw new FriendRequestPermissionException();
    }
    if (relationship.status !== 'Request') {
      throw new FriendRequestPendingException();
    }
    const newRelationShip = await this.friendModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(friendRequestId), status: 'Request' },
        { status: 'Accept' },
        { new: true },
      )
      .lean();

    if (!newRelationShip) throw new FriendRequestExitedException();
    if (status === 'Accept') {
      await Promise.all([
        author
          .updateOne(
            { $push: { friends: string.getId(relationship.friendProfile) } },
            { new: true },
          )
          .lean(),
        friend
          .updateOne(
            { $push: { friends: string.getId(relationship.authorProfile) } },
            { new: true },
          )
          .lean(),
      ]);
    }

    return {
      ...relationship,
      authorProfile: author.toObject(),
      friendProfile: friend.toObject(),
      status: status,
    };
  }

  async cancel(
    friendRequestId: string,
    friendAccountId: string,
  ): Promise<FriendRequest<Profile<User>>> {
    const { relationship, author, friend } = await this.validateFriendById(
      friendRequestId,
    );
    if (relationship.authorId !== friendAccountId) {
      throw new FriendRequestPermissionException();
    }
    switch (relationship.status) {
      case 'Accept':
        throw new FriendRequestAcceptedException();
      case 'Reject':
        throw new FriendRequestRejectException();
      case 'Request': {
        const currentRelationship = await this.friendModel
          .findOneAndDelete({
            _id: new Types.ObjectId(friendRequestId),
            status: 'Request',
          })
          .lean();
        if (!currentRelationship) throw new FriendRequestExitedException();
        break;
      }
    }
    return {
      ...relationship,
      authorProfile: author.toObject(),
      friendProfile: friend.toObject(),
    };
  }

  async listRequest(
    userId: string,
    action: 'pending' | 'request',
  ): Promise<FriendRequest<Profile<User>>[]> {
    const query =
      action === 'request'
        ? { friendId: userId, status: 'Request' }
        : { authorId: userId, status: 'Request' };

    const [user, relationship] = await Promise.all([
      this.profileModel.findOne({ user: userId }, 'user bio avatar').lean(),
      this.friendModel
        .find(query)
        .skip(0)
        .limit(10)
        .populate(requestFriendListPopulate)
        .lean(),
    ]);
    if (!user) throw new UserNotfoundException();
    return relationship;
  }
}
