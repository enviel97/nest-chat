import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName, Services } from 'src/common/named';
import { ConversationDocument } from 'src/models/conversations';

@Injectable()
export class ConversationService implements IConversationsService {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessengerService,
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
      .populate('participant', 'firstName lastName email')
      .populate({
        path: 'lastMessage',
        select: 'content author _id createdAt',
        populate: {
          path: 'author',
          select: 'firstName lastName email _id',
        },
      })
      .lean();

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
    });

    if (participant) {
      await model.save();
    }

    return {
      isNew: true,
      conversation: {
        author: conversation.authorId,
        participant: participant ?? this.userUnknown,
      },
    };
  }

  async getConversations(authorId: string) {
    if (!authorId) throw new BadRequestException();
    return await this.conversationModel
      .find({ author: authorId })
      .populate('participant', 'firstName lastName email')
      .populate({
        path: 'lastMessage',
        select: 'content author _id createdAt',
        populate: {
          path: 'author',
          select: 'firstName lastName email _id',
        },
      })
      .lean();
  }

  async getConversation(id: string): Promise<IConversation> {
    if (!id) throw new BadRequestException();
    const [conversation, messages] = await Promise.all([
      this.conversationModel
        .findById(id)
        .populate('participant', 'firstName lastName email')
        .lean(),
      this.messageService.getMessages(id),
    ]);

    // Todo get other value

    return { ...(conversation as IConversation), messages: messages };
  }
}
