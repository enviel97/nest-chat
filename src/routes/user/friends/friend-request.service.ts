import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { FriendDocument } from 'src/models/friend-request';
import { UserDocument } from 'src/models/users';
import string from 'src/utils/string';
import {
  FriendNotFoundException,
  FriendRequestException,
  FriendRequestPendingException,
} from '../exceptions/friend-request.exception';
import { UserNotfoundException } from '../exceptions/user.exception';

@Injectable()
export class FriendRequestService implements IFriendRequestService {
  constructor(
    @InjectModel(ModelName.FriendRequest)
    private readonly friendModel: FriendDocument,
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
  ) {}

  private normalProjectionUser: string = 'email firstName lastName';

  private async validateFriendByUser(authorId: string, userId: string) {
    const [author, newFriend] = await Promise.all([
      this.userModel.findById(authorId, this.normalProjectionUser),
      this.userModel.findById(userId, this.normalProjectionUser),
    ]);
    if (!author) throw new BadRequestException(`Author not found`);
    if (!newFriend) throw new BadRequestException(`User not found`);
    const friendRelationships = await this.friendModel.find({
      $or: [
        { $and: [{ author: authorId }, { friend: userId }] },
        { $and: [{ author: userId }, { friend: authorId }] },
      ],
    });

    return {
      author,
      friend: newFriend,
      relationship: friendRelationships.at(0),
    };
  }

  private async validateFriendById(friendId: string, userId: string) {
    const [relationship, friend] = await Promise.all([
      this.friendModel.findById(friendId).populate('author'),
      this.userModel.findById(userId),
    ]);

    if (!relationship) throw new FriendNotFoundException();
    if (!friend) throw new UserNotfoundException();

    return {
      author: relationship.author,
      relationship,
      friend,
    };
  }

  async createFriendRequest(
    friendId: string,
    userId: string,
  ): Promise<FriendRequest<User>> {
    const { author, friend, relationship } = await this.validateFriendByUser(
      userId,
      friendId,
    );
    if (relationship) throw new FriendRequestException();

    const friendRequest = await this.friendModel.create({
      author: userId,
      friend: friendId,
      status: 'Request',
    });

    return {
      ...friendRequest,
      author: author.toObject(),
      friend: friend.toObject(),
    };
  }

  async createFriendResponse(
    friendId: string,
    friendRequestId: string,
    status: 'Accept' | 'Reject',
  ): Promise<AddFriendResponse> {
    const { relationship, friend } = await this.validateFriendById(
      friendRequestId,
      friendId,
    );
    if (!relationship) throw new FriendNotFoundException();
    if (relationship.status !== 'Request') {
      throw new FriendRequestPendingException();
    }
    if (relationship.friend !== friendId) {
      throw new FriendRequestException();
    }
    switch (status) {
      case 'Accept': {
        const authorId = string.getId(relationship.author);
        const [user, newFriend] = await Promise.all([
          this.userModel
            .findByIdAndUpdate(
              authorId,
              { $push: { friends: friendId } },
              { new: true },
            )
            .lean(),
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
        await relationship.update({ status: 'Accept' }).lean();
        return {
          author: <User>relationship.author,
          friend: friend,
          status: 'Reject',
        };
      }
    }
  }

  async getFriendRequest(userId: string): Promise<FriendRequest<IUser>[]> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new UserNotfoundException();
    const relationship: FriendRequest<IUser>[] = await this.friendModel
      .find({ friend: userId })
      .populate([
        { path: 'friend', select: 'firstName lastName ' },
        { path: 'author', select: 'firstName lastName ' },
      ])
      .lean();

    return relationship;
  }

  unFriend(friendId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
