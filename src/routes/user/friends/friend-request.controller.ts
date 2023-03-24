import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event, Routes, Services } from 'src/common/define';
import { ParseObjectIdPipe } from 'src/middleware/parse/mongoDb';
import {
  CreateFriendRequestDTO,
  CreateFriendResponseDTO,
} from 'src/models/friends';
import { AuthUser } from 'src/utils/decorates';
import string from 'src/utils/string';
import { AuthenticateGuard } from '../../auth/utils/Guards';

@Controller(Routes.FRIENDS)
@UseGuards(AuthenticateGuard)
export class FriendRequestController {
  constructor(
    @Inject(Services.USERS)
    private readonly memberService: IMemberService,
    @Inject(Services.FRIENDS)
    private readonly friendsService: IFriendRequestService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async sendFriendRequest(
    @AuthUser() user: User,
    @Body() createFriendRequestDTO: CreateFriendRequestDTO,
  ) {
    const friendRequest = await this.friendsService.createFriendRequest(
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

  @Post()
  async sendFriendResponse(
    @AuthUser() user: User,
    @Body() createFriendResponseDTO: CreateFriendResponseDTO,
  ) {
    const { author, friend, status } =
      await this.friendsService.createFriendResponse(
        string.getId(user),
        createFriendResponseDTO.friendRequestId,
        createFriendResponseDTO.status,
      );

    this.eventEmitter.emit(Event.EVENT_FRIEND_SEND_REQUEST, {
      friend,
      author,
      status,
    });

    return {
      code: 200,
      message: `${string.getFullName(
        author,
      )} accept friend request from ${string.getFullName(friend)}`,
      data: friend,
    };
  }
}
