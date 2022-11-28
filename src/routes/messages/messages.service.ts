import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/named';
import { ConversationDocument } from 'src/models/conversations';
import { MessageDocument } from 'src/models/messages';

@Injectable()
export class MessagesService implements IMessengerService {
  constructor(
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,

    @InjectModel(ModelName.Message)
    private readonly messageModel: MessageDocument,
  ) {}

  private validConversation(conversation: Conversation, participantId: string) {
    const { author, participant } = conversation;

    if (author !== participantId && participant !== participantId) {
      throw new ForbiddenException('Messenger failure');
    }
  }

  private async getConversationByID(conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) throw new BadRequestException('Conversation not found');

    if (!conversation.author || !conversation.participant) {
      throw new InternalServerErrorException();
    }
    return conversation;
  }

  async getMessages(conversationId: string): Promise<IMessage[]> {
    const value = await this.messageModel
      .find(
        { conversationId: conversationId },
        {},
        { sort: { createdAt: 'desc' } },
      )
      .populate('author', 'firstName lastName email')
      .lean();
    return value as IMessage[];
  }

  async createMessage(params: MessageCreateParams): Promise<IMessage> {
    try {
      const { conversationId, content, author } = params;
      const conversation = await this.getConversationByID(conversationId);
      this.validConversation(conversation, params.author);

      const message = await this.messageModel.create({
        conversationId: conversationId,
        content: content,
        author: author,
      });

      conversation.lastMessage = (message.id ?? message._id).toString();
      await conversation.save();

      return message.toObject();
    } catch (exception) {
      throw exception;
    }
  }
}
