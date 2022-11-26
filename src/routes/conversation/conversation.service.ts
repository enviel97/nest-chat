import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName, Services } from 'src/common/named';
import { ConversationDocument } from 'src/models/conversations';

@Injectable()
export class ConversationService implements IConversationsService {
  constructor(
    @Inject(Services.USERS)
    private readonly userService: IUserService,
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,
  ) {}

  private readonly userUnknown: User = {
    firstName: 'Chat',
    lastName: 'User',
    email: 'user@unknown',
  };

  async createConversation(conversation: ConversationCreateParams) {
    if (!conversation.authorId) {
      throw new BadRequestException();
    }

    const channel = await this.conversationModel
      .findOne({
        author: conversation.authorId,
        participant: conversation.participantId,
      })
      .populate('participant', 'firstName lastName email');

    if (channel) {
      return {
        isNew: false,
        conversation: channel,
      };
    }

    const participant = await this.userService.findUser({
      id: conversation.participantId,
    });

    const model = new this.conversationModel({
      author: conversation.authorId,
      participant: participant.id,
      lastMessage: conversation.message ?? '',
      lastMessageTime: conversation.message ? new Date().toISOString() : '',
    });

    if (participant) {
      await model.save();
    }

    return {
      isNew: true,
      conversation: {
        author: conversation.authorId,
        participant: participant ?? this.userUnknown,
        lastMessage: conversation.message ?? '',
        lastMessageTime: conversation.message ? new Date().toISOString() : '',
      },
    };
  }

  async getConversations(authorId: string) {
    if (!authorId) throw new BadRequestException();
    return await this.conversationModel
      .find({ author: authorId })
      .populate('participant', 'firstName lastName email');
  }

  async getConversation(id: string): Promise<Partial<IConversation>> {
    if (!id) throw new BadRequestException();
    const conversation = await this.conversationModel
      .findById(id)
      .populate('participant', 'firstName lastName email');

    // Todo get other value
    return conversation;
  }
}
