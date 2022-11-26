import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { identity } from 'rxjs';
import { Routes, Services } from 'src/common/named';
import { CreateConversationDTO } from 'src/models/conversations';
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.conversationsService.createConversation({
      authorId: req.user?.id ?? '',
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
  async getAllConversation(@Req() req: Request, @Res() res: Response) {
    const author = req.user;
    const data = await this.conversationsService.getConversations(author['id']);
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
