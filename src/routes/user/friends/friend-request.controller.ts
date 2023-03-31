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
    @Inject(Services.FRIEND_REQUEST)
    private readonly friendRequestService: IFriendRequestService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('request')
  async sendFriendRequest(
    @AuthUser() user: User,
    @Body() createFriendRequestDTO: CreateFriendRequestDTO,
  ) {
    const friendRequest = await this.friendRequestService.create(
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

  @Patch('response/:id')
  async sendFriendResponse(
    @Param('id', ParseObjectIdPipe) friendRequestId: string,
    @AuthUser() user: User,
    @Body() createFriendResponseDTO: CreateFriendResponseDTO,
  ) {
    const friendResponse = await this.friendRequestService.response(
      friendRequestId,
      string.getId(user),
      createFriendResponseDTO.status,
    );

    this.eventEmitter.emit(Event.EVENT_FRIEND_SEND_REQUEST, friendResponse);
    console.log(friendResponse);
    return {
      code: 200,
      message: `${friendResponse.friendProfile.user.getFullName()} ${
        friendResponse.status
      } friend request from ${friendResponse.friendProfile.user.getFullName()}`,
      data: friendResponse.authorProfile,
    };
  }

  @Delete(':id')
  async cancelFriendRequest(
    @AuthUser() user: User,
    @Param('id', ParseObjectIdPipe) friendRequestId: string,
  ) {
    const result = await this.friendRequestService.cancel(
      friendRequestId,
      user.getId(),
    );
    return {
      code: 200,
      message: 'Delete friend request successfully',
      data: friendRequestId,
    };
  }

  @Get('request')
  async getFriendRequest(@AuthUser() user: User) {
    const listFriendRequest = await this.friendRequestService.listRequest(
      user.getId(),
    );
    return {
      code: 200,
      message: 'Get friend request list successfully',
      data: listFriendRequest,
    };
  }
}
