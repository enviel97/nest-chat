import {
  BadRequestException,
  ForbiddenException,
  NestMiddleware,
} from '@nestjs/common';
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
import { validateObjectId } from '../utils/message.validate';
import { MessageConversationId } from '../utils/messages.exception';

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

  private validateMessage(creator: User, conversation?: Conversation) {
    if (!conversation) return 'Conversation not found';
    const { members } = conversation.participant as Participant<User>;
    const index = members.findIndex(
      (member) => member.getId() === creator.getId(),
    );
    if (index < 0) return 'Permissions are not allowed';
  }

  async use(req: any, res: Response, next: NextFunction) {
    // check user login
    if (!req.user) throw new ForbiddenException();

    // check conversation id
    const { conversationId } = req.params;
    if (!validateObjectId(conversationId)) throw new MessageConversationId();

    const conversation = await this.getConversationByID(conversationId);
    const validateMess = this.validateMessage(req.user, conversation);
    if (validateMess) throw new BadRequestException(validateMess);
    // validation
    req.conversation = conversation;
    next();
  }
}
