import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { ConversationDocument } from 'src/models/conversations';
import { ParticipantDocument } from 'src/models/participants';
import { UserDocument } from 'src/models/users';
import { mapToEntities } from 'src/utils/map';
import string from 'src/utils/string';

@Injectable()
export class ConversationService implements IConversationsService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
    @InjectModel(ModelName.Participant)
    private readonly participantModel: ParticipantDocument,
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

  private async getParticipant(
    participants: string[],
  ): Promise<{ participant: Participant<User>; isNew: boolean }> {
    const users = await this.userModel.find({ email: { $in: participants } });
    if (users.length === 0 || users.length !== participants.length) {
      throw new BadRequestException('Users not found');
    }
    const entity = mapToEntities(users);
    const participant = await this.participantModel
      .findOne({
        members: { $all: entity.ids },
      })
      .populate('members', 'firstName lastName email');

    if (!participant) {
      const participant = await this.participantModel.create({
        members: entity.ids,
        roles: entity.ids.reduce((acc, obj) => {
          acc[string.getId(obj)] = 'Member';
          return acc;
        }, {}),
      });
      return {
        participant: {
          ...participant.toObject(),
          members: users,
        },
        isNew: true,
      };
    }

    return {
      participant: <Participant<User>>participant,
      isNew: false,
    };
  }

  async createConversation(conversationDTO: ConversationCreateParams) {
    if (!conversationDTO.authorId) {
      throw new BadRequestException();
    }

    const { participant, isNew } = await this.getParticipant(
      conversationDTO.emailParticipant,
    );

    if (isNew) {
      const model = new this.conversationModel({
        author: conversationDTO.authorId,
        participant: string.getId(participant),
      });
      const result = await model.save();
      return {
        ...result.toObject(),
        participant: participant,
      };
    }

    const conversation = await this.conversationModel
      .findOne({
        author: conversationDTO.authorId,
        participant: string.getId(participant as any),
      })
      .populate([
        {
          path: 'participant',
          populate: {
            path: 'members',
            select: '_id firstName lastName email',
          },
        },
        {
          path: 'lastMessage',
          select: '_id content author createdAt',
          populate: {
            path: 'author',
            select: '_id firstName lastName email ',
          },
        },
      ]);

    return conversation;
  }

  async getConversations(authorId: string) {
    if (!authorId) throw new BadRequestException();
    const { ids } = mapToEntities(
      await this.participantModel.find({
        members: authorId,
      }),
    );

    return await this.conversationModel
      .find(
        { $or: [{ author: authorId }, { participant: { $in: ids } }] },
        {},
        { sort: { updatedAt: -1 } },
      )
      .populate([
        {
          path: 'author',
          select: 'firstName lastName email',
        },
        {
          path: 'participant',
          populate: {
            path: 'members',
            select: 'firstName lastName email',
          },
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
