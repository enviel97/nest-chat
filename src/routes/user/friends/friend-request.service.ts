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

  private async validateFriendById(
    friendRequestId: string,
    friendAccountId: string,
  ) {
    const relationship = await this.friendModel.findById(friendRequestId);
    if (!relationship) throw new FriendNotFoundException();
    if (relationship.friendId !== friendAccountId) {
      throw new FriendRequestException();
    }
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
      friendAccountId,
    );
    if (relationship.status !== 'Request') {
      throw new FriendRequestPendingException();
    }

    switch (status) {
      case 'Accept': {
        await Promise.all([
          relationship.updateOne({ status: 'Accept' }, { new: true }),
          author
            .updateOne(
              { $push: { friends: relationship.friendId } },
              { new: true },
            )
            .lean(),
          friend
            .updateOne(
              { $push: { friends: relationship.authorId } },
              { new: true },
            )
            .lean(),
        ]);
        break;
      }
      case 'Reject': {
        await relationship
          .updateOne({ status: 'Reject' }, { new: true })
          .lean();
        break;
      }
    }

    return {
      ...relationship.toObject(),
      authorProfile: author.toObject(),
      friendProfile: friend.toObject(),
    };
  }

  async cancel(friendRequestId: string): Promise<CancelFriendRequest> {
    // const { relationship, author, friend } = await this.validateFriendById(
    //   friendRequestId,
    // );
    // switch (relationship.status) {
    //   case 'Accept':
    //     throw new FriendRequestAcceptedException();
    //   case 'Reject':
    //     throw new FriendRequestRejectException();
    //   case 'Request': {
    //     await relationship.delete();
    //     break;
    //   }
    // }
    // return {
    //   friend: string.getId(friend.user),
    //   author: string.getId(author.user),
    // };
    throw new Error('Un implement');
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
