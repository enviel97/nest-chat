import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelName } from 'src/common/define';
import { FriendRequestDocument } from 'src/models/friend-request';
import { ProfileDocument } from 'src/models/profile';
import { AuthenticateGuard } from 'src/routes/auth/utils/Guards';
import string from 'src/utils/string';
import {
  FriendNotFoundException,
  FriendRequestAcceptedException,
  FriendRequestExitedException,
  FriendRequestPendingException,
  FriendRequestPermissionException,
  FriendRequestRejectException,
} from '../exceptions/friend-request.exception';
import { UserNotfoundException } from '../exceptions/user.exception';
import {
  normalProjectionUser,
  requestFriendListPopulate,
} from '../populate/friend-request.populate';

@Injectable()
@UseGuards(AuthenticateGuard)
export class FriendRequestService implements IFriendRequestService {
  constructor(
    @InjectModel(ModelName.FriendRequest)
    private readonly friendRequestModel: FriendRequestDocument,
    @InjectModel(ModelName.Profile)
    private readonly profileModel: ProfileDocument,
  ) {}

  async getQuantity(
    userId: string,
    action: 'pending' | 'request',
  ): Promise<number> {
    const query =
      action === 'request'
        ? { friendId: userId, status: 'Request' }
        : { authorId: userId, status: 'Request' };
    const quantity = await this.friendRequestModel.count(query);
    return quantity;
  }

  async create(
    friendId: string,
    userId: string,
  ): Promise<FriendRequest<Profile<User>>> {
    const [relationship, author, friend] = await Promise.all([
      this.friendRequestModel
        .findOne({
          $or: [
            { $and: [{ authorId: friendId }, { friendId: userId }] },
            { $and: [{ authorId: userId }, { friendId: friendId }] },
          ],
        })
        .lean(),
      this.profileModel
        .findOne({ user: userId })
        .populate('user', normalProjectionUser)
        .lean(),
      this.profileModel
        .findOne({ user: friendId })
        .populate('user', normalProjectionUser)
        .lean(),
    ]);
    // return relationship
    if (!author) throw new BadRequestException(`Author not found`);
    if (!friend) throw new BadRequestException(`Friend not found`);
    if (author.friends.includes(string.getId(friend))) {
      throw new BadRequestException(`You two are already friends`);
    }

    switch (relationship?.status) {
      case 'Accept':
        throw new FriendRequestAcceptedException();
      case 'Reject':
        throw new FriendRequestRejectException();
      case 'Request': {
        // return all ready relation ship
        return {
          ...relationship,
          authorProfile: author as Profile<User>,
          friendProfile: friend as Profile<User>,
        };
      }
      default: {
        // not found relationship
        const friendRequest = await this.friendRequestModel.create({
          authorId: userId,
          authorProfile: author.getId(),
          friendId: friendId,
          friendProfile: friend.getId(),
          status: 'Request',
        });

        return {
          ...friendRequest.toObject(),
          authorProfile: author as Profile<User>,
          friendProfile: friend as Profile<User>,
        };
      }
    }
  }

  private async validateFriendById(friendRequestId: string) {
    const relationship = await this.friendRequestModel
      .findById(friendRequestId)
      .lean();
    if (!relationship) throw new FriendNotFoundException();

    const [profileAuthor, profileUser] = await Promise.all([
      this.profileModel
        .findById(relationship.authorProfile)
        .populate('user', normalProjectionUser)
        .lean(),
      this.profileModel
        .findById(relationship.friendProfile)
        .populate('user', normalProjectionUser)
        .lean(),
    ]);
    if (!profileAuthor) throw new BadRequestException(`Author not found`);
    if (!profileUser) throw new BadRequestException(`User not found`);
    return {
      author: profileAuthor as Profile<User>,
      friend: profileUser as Profile<User>,
      relationship,
    };
  }

  private async updateFriendList(authorId: string, friendId: string) {
    const [authorProfile, friendProfile] = await Promise.all([
      this.profileModel
        .findByIdAndUpdate(authorId, { $push: { friends: friendId } })
        .lean(),
      this.profileModel
        .findByIdAndUpdate(friendId, { $push: { friends: authorId } })
        .lean(),
    ]);
    return { authorProfile, friendProfile };
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
    const newRelationShip = await this.friendRequestModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(friendRequestId), status: 'Request' },
        { status },
        { new: true },
      )
      .lean();

    if (!newRelationShip) throw new FriendRequestExitedException();
    if (status === 'Accept') {
      await this.updateFriendList(author.getId(), friend.getId());
    }
    return {
      ...relationship,
      authorProfile: author,
      friendProfile: friend,
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
    switch (relationship?.status) {
      case 'Accept':
        throw new FriendRequestAcceptedException();
      case 'Reject':
        throw new FriendRequestRejectException();
      case 'Request': {
        const currentRelationship = await this.friendRequestModel
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
      authorProfile: author,
      friendProfile: friend,
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
      this.friendRequestModel
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
