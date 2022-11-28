import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Routes, Services } from 'src/common/named';
import { CreateConversationDTO } from 'src/models/conversations';
import { AuthUser } from 'src/utils/decorates';
import { AuthenticateGuard } from '../auth/utils/Guards';

@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticateGuard)
export class ConversationController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
  ) {}

  @Post()
  async createConversation(
    @Body() conversation: CreateConversationDTO,
    @AuthUser() author: User,
    @Res() res: Response,
  ) {
    const result = await this.conversationsService.createConversation({
      authorId: author?.id ?? '',
      ...conversation,
    });

    return res.json({
      code: HttpStatus.OK,
      message: result.isNew
        ? 'Create successfully'
        : 'The conversation already exists',
      data: result,
    });
  }

  @Get()
  async getAllConversation(@AuthUser() author: User, @Res() res: Response) {
    const data = await this.conversationsService.getConversations(
      author.id ?? author._id,
    );
    return res.json({
      code: HttpStatus.OK,
      message: 'Get list conversation successfully',
      data: data,
    });
  }

  @Get(':id')
  async getConversation(@Param('id') params: string, @Res() res: Response) {
    const data = await this.conversationsService.getConversation(params);
    return res.json({
      code: HttpStatus.OK,
      message: 'Get list conversation successfully',
      data: data,
    });
  }
}
