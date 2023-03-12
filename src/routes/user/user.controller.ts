import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/common/define';
import { mapToResponse } from 'src/utils/map';
import { AuthenticateGuard } from '../auth/utils/Guards';

@Controller(Routes.USERS)
@UseGuards(AuthenticateGuard)
export class UserController {
  constructor(
    @Inject(Services.USERS)
    private readonly userService: IUserService,
  ) {}

  @Get('search')
  async searchUser(@Query('participant') participant: string) {
    if (!participant) throw new BadRequestException('Provide a valid query');
    const result = await this.userService.searchUsers(participant.trim());
    return mapToResponse({
      code: 200,
      data: result,
    });
  }
}