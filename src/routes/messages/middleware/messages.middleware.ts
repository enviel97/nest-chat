import { BadRequestException, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import type { ConversationDocument } from 'src/models/conversations';
import type { Response, NextFunction } from 'express';
import ModelCache from 'src/middleware/cache/decorates/ModelCache';
import { CacheModel } from 'src/common/cache';
import {
  populateLastMessage,
  populateParticipant,
} from 'src/routes/conversation/utils/config';

export class MessagesMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,
  ) {}

  @ModelCache({ modelName: CacheModel.MESSAGE_CONVERSATION })
  private async getConversationByID(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate([populateParticipant, populateLastMessage])
      .lean();
    return conversation;
  }

  async use(req: any, res: Response, next: NextFunction) {
    const { conversationId } = req.params;
    if (!conversationId) {
      throw new BadRequestException('Conversation id is empty');
    }
    const conversation = await this.getConversationByID(conversationId);
    req.conversation = conversation;
    next();
  }
}
