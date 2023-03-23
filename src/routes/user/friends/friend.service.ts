import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { FriendDocument } from 'src/models/friends';
import { UserDocument } from 'src/models/users';
import string from 'src/utils/string';
import {
  FriendNotFoundException,
  FriendRequestException,
} from '../exceptions/friend.exception';

@Injectable()
export class FriendService implements IFriendService {
  constructor(
    @InjectModel(ModelName.Friend)
    private readonly friendModel: FriendDocument,
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
  ) {}

  private normalProjectionUser: string = 'email firstName lastName';

  private async validateFriend(authorId: string, userId: string) {
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

  async createFriendRequest(
    friendId: string,
    userId: string,
  ): Promise<Friend<User>> {
    const { author, friend, relationship } = await this.validateFriend(
      userId,
      friendId,
    );
    if (relationship) throw new FriendRequestException(relationship.toObject());

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
    userId: string,
    status: 'Accept' | 'Reject',
  ): Promise<AddFriendResponse> {
    const { author, friend, relationship } = await this.validateFriend(
      userId,
      friendId,
    );
    if (!relationship) throw new FriendNotFoundException();
    if (relationship.status === 'Request')
      throw new FriendRequestException(relationship.toObject());

    switch (status) {
      case 'Accept': {
        const [user, newFriend] = await Promise.all([
          author.update({ $push: { friends: friendId } }, { new: true }).lean(),
          friend.update({ $push: { friends: author } }, { new: true }).lean(),
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
          author: author,
          friend: friend,
          status: 'Accept',
        };
      }
    }
  }

  getFriendRequest(userId: string): Promise<Partial<IUser>[]> {
    throw new Error('Method not implemented.');
  }

  unFriend(friendId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
