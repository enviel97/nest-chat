import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/common/define';
import { SearchCache } from 'src/middleware/cache/decorates/SearchCache';
import { mapToResponse } from 'src/utils/map';
import { AuthenticateGuard } from '../../auth/utils/Guards';

@Controller(Routes.USERS)
@UseGuards(AuthenticateGuard)
export class MemberController {
  constructor(
    @Inject(Services.USERS)
    private readonly userService: IMemberService,
  ) {}

  @SearchCache(10)
  @Get('search')
  async searchUser(@Query('participant') participant: string) {
    if (!participant) throw new BadRequestException('Provide a valid query');
    const result = await this.userService.searchUsers(participant.trim());
    return mapToResponse({ code: 200, data: result });
  }
}
