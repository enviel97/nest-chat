import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event, Routes, Services } from 'src/common/define';
import { ParseObjectIdPipe } from 'src/middleware/parse/mongoDb';
import {
  CreateFriendRequestDTO,
  CreateFriendResponseDTO,
} from 'src/models/friend-request';
import { AuthUser } from 'src/utils/decorates';
import string from 'src/utils/string';
import { AuthenticateGuard } from '../../auth/utils/Guards';

@Controller(Routes.FRIEND_REQUEST)
@UseGuards(AuthenticateGuard)
export class FriendRequestController {
  constructor(
    @Inject(Services.FRIENDS)
    private readonly friendsService: IFriendRequestService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async sendFriendRequest(
    @AuthUser() user: User,
    @Body() createFriendRequestDTO: CreateFriendRequestDTO,
  ) {
    const friendRequest = await this.friendsService.create(
      createFriendRequestDTO.userId,
      string.getId(user),
    );

    this.eventEmitter.emit(Event.EVENT_FRIEND_SEND_REQUEST, friendRequest);

    return {
      code: 200,
      message: 'Friends request has been seen',
      data: friendRequest,
    };
  }

  @Patch(':id')
  async sendFriendResponse(
    @Param('id', ParseObjectIdPipe) friendRequestId: string,
    @AuthUser() user: User,
    @Body() createFriendResponseDTO: CreateFriendResponseDTO,
  ) {
    const { author, friend, status } = await this.friendsService.response(
      string.getId(user),
      friendRequestId,
      createFriendResponseDTO.status,
    );

    this.eventEmitter.emit(Event.EVENT_FRIEND_SEND_REQUEST, {
      friend,
      author,
      status,
    });

    return {
      code: 200,
      message: `${author.getFullName()} accept friend request from ${friend.getFullName()}`,
      data: friend,
    };
  }

  @Delete(':id')
  async cancelFriendRequest(
    @AuthUser() user: User,
    @Param('id', ParseObjectIdPipe) friendRequestId: string,
  ) {
    const result = await this.friendsService.cancel(
      friendRequestId,
      user.getId(),
    );
    return {
      code: 200,
      message: 'Delete friend request successfully',
      data: friendRequestId,
    };
  }

  @Get()
  async getFriendRequest(@AuthUser() user: User) {
    const listFriendRequest = await this.friendsService.list(user.getId());
    return {
      code: 200,
      message: 'Get friend request list successfully',
      data: listFriendRequest,
    };
  }
}
