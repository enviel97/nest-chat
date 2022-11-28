import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { Routes, Services } from 'src/common/named';
import { CreateMessageDTO } from 'src/models/messages';

import { AuthUser } from 'src/utils/decorates';
import { AuthenticateGuard } from '../auth/utils/Guards';

@Controller(Routes.MESSAGES)
@UseGuards(AuthenticateGuard)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessengerService,
  ) {}

  @Post()
  async createMessage(
    @AuthUser() user: IUser,
    @Body() createMessageDTO: CreateMessageDTO,
  ) {
    return await this.messageService.createMessage({
      author: user.id ?? user._id,
      ...createMessageDTO,
    });
  }
}
