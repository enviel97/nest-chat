import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName, Services } from 'src/common/define';
import { ConversationDocument } from 'src/models/conversations';
import string from 'src/utils/string';

@Injectable()
export class ConversationService implements IConversationsService {
  constructor(
    @Inject(Services.USERS)
    private readonly userService: IUserService,
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,
  ) {}

  async findConversationById(id: string): Promise<Conversation> {
    if (!id) return;
    return await this.conversationModel.findById(id);
  }

  private readonly userUnknown: User = {
    firstName: 'Chat',
    lastName: 'User',
    email: 'user@unknown',
  };

  async createConversation(conversation: ConversationCreateParams) {
    if (!conversation.authorId) {
      throw new BadRequestException();
    }

    const participant = await this.userService.findUser({
      email: conversation.emailParticipant,
    });

    if (!participant) {
      throw new BadRequestException('Participant not found');
    }

    return await this.conversationModel
      .findOne({
        author: conversation.authorId,
        participant: string.getId(participant as any),
      })
      .then(async (channel) => {
        if (!channel) {
          const model = new this.conversationModel({
            author: conversation.authorId,
            participant: participant.id,
          });
          const result = await model.save();

          return {
            ...(result.toObject() as IConversation),
            participant: participant,
          };
        }
        return (
          await channel.populate([
            { path: 'participant', select: 'firstName lastName email' },
            {
              path: 'lastMessage',
              select: 'content author _id createdAt',
              populate: {
                path: 'author',
                select: 'firstName lastName email _id',
              },
            },
          ])
        ).toObject();
      });
  }

  async getConversations(authorId: string) {
    if (!authorId) throw new BadRequestException();
    return await this.conversationModel
      .find(
        { $or: [{ author: authorId }, { participant: authorId }] },
        {},
        {
          sort: {
            updatedAt: -1,
          },
        },
      )
      .populate([
        {
          path: 'author',
          select: 'firstName lastName email',
        },
        {
          path: 'participant',
          select: 'firstName lastName email',
        },
        {
          path: 'lastMessage',
          select: 'content author _id createdAt',
          populate: {
            path: 'author',
            select: 'firstName lastName email _id',
          },
        },
      ])
      .lean();
  }
}
