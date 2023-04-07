import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, Services } from 'src/common/define';
import { AuthUser } from 'src/utils/decorates';
import { mapToResponse } from 'src/utils/map';
import { AuthenticateGuard } from '../../auth/utils/Guards';

@Controller(Routes.PROFILE)
@UseGuards(AuthenticateGuard)
export class ProfileController {
  constructor(
    @Inject(Services.PROFILE)
    private readonly profileService: IProfileService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get('/friends')
  async getListFriends(@AuthUser() user: User) {
    const { friends } = await this.profileService.listFriends(user.getId());

    return {
      code: 200,
      data: friends,
      message: 'Get list friend successfully',
    };
  }

  @Get('search')
  async searchProfile(@AuthUser() user: User, @Query('query') query: string) {
    if (!query) throw new BadRequestException('Query is invalid');
    const result = await this.profileService.searchFriend(
      user.getId(),
      query.trim(),
    );

    return mapToResponse({
      code: 200,
      data: result,
    });
  }
}
