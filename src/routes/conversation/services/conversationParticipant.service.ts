import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { ConversationDocument } from 'src/models/conversations';
import { ParticipantDocument } from 'src/models/participants';
import { UserDocument } from 'src/models/users';
import { mapToEntities } from 'src/utils/map';
import string from 'src/utils/string';

@Injectable()
export class ConversationParticipantService implements IParticipantService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
    @InjectModel(ModelName.Participant)
    private readonly participantModel: ParticipantDocument,
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,
  ) {}

  private async checkPermission(conversationId: string, inviter: string) {
    if (!conversationId) throw new BadRequestException('Id not valid');
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate([
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
    if (!conversation) throw new BadRequestException('Conversation not found');
    const participant = await this.participantModel
      .findById(conversation.participant)
      .lean();
    if (participant.roles[inviter] !== 'Admin') {
      throw new BadRequestException("You don't have permission");
    }

    return {
      conversation,
      participant,
    };
  }

  private async checkParticipantByUsers(ids: string[]) {
    const unique = new Set<string>(ids);
    const users = await this.userModel.find({ _id: { $in: [...unique] } });

    if (users.length === 0 || users.length !== unique.size) {
      throw new BadRequestException('Users not found');
    }
    const entity = mapToEntities(users);
    const participant = await this.participantModel
      .findOne({
        $and: [
          { members: { $all: entity.ids } },
          { members: { $size: entity.ids.length } },
        ],
      })
      .lean();

    if (participant) throw new BadRequestException('Exits conversation');

    return entity;
  }

  private async updateParticipant(
    id: string,
    members: string[],
    roles: ParticipantRole,
  ) {
    const _roles = members.reduce((acc, id) => {
      acc[id] = roles[id] ?? 'Member';
      return acc;
    }, {});

    return await this.participantModel
      .findByIdAndUpdate(id, { members, roles: _roles }, { new: true })
      .populate('members', 'firstName lastName email')
      .lean();
  }

  async addMoreMembers(
    conversationId: string,
    params: ConversationModifiedMembers,
  ): Promise<ResponseModified> {
    const { conversation, participant } = await this.checkPermission(
      conversationId,
      params.author,
    );

    const newUser = await this.checkParticipantByUsers([
      ...participant.members,
      ...params.idParticipant,
    ]);

    const newParticipant = await this.updateParticipant(
      string.getId(participant),
      newUser.ids,
      participant.roles,
    );

    await this.conversationModel
      .findByIdAndUpdate(
        conversationId,
        { updatedAt: participant.updatedAt },
        { new: true },
      )
      .lean();

    const inviter = await this.userModel.find({
      _id: { $in: [...params.idParticipant] },
    });

    return {
      conversation: {
        ...conversation,
        participant: {
          ...newParticipant,
          members: newUser.entities,
        },
      },
      newUsers: inviter,
    };
  }

  async removeMoreMembers(
    conversationId: string,
    params: ConversationModifiedMembers,
  ): Promise<ResponseModified> {
    const { conversation, participant } = await this.checkPermission(
      conversationId,
      params.author,
    );

    if (participant.members.length <= 3) {
      throw new BadRequestException('Group chat must be more than 2 people');
    }

    const ids: string[] = participant.members.filter((member) => {
      return !params.idParticipant.includes(member);
    });

    if (
      participant.members.length - ids.length !==
      params.idParticipant.length
    ) {
      throw new BadRequestException("Can't found user in current conversation");
    }

    const newUser = await this.checkParticipantByUsers(ids);

    const newParticipant = await this.updateParticipant(
      string.getId(participant),
      newUser.ids,
      participant.roles,
    );

    await this.conversationModel
      .findByIdAndUpdate(
        conversationId,
        { updatedAt: participant.updatedAt },
        { new: true },
      )
      .lean();

    const banners = await this.userModel.find({
      _id: { $in: [...params.idParticipant] },
    });

    return {
      conversation: {
        ...conversation,
        participant: {
          ...newParticipant,
          members: newUser.entities,
        },
      },
      newUsers: banners,
    };
  }
}
