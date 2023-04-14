import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { ConversationDocument } from 'src/models/conversations';
import { ParticipantDocument } from 'src/models/participants';
import { UserDocument } from 'src/models/users';
import { mapToEntities, merge } from 'src/utils/map';
import string from 'src/utils/string';
import { populateLastMessage, populateParticipant } from '../utils/config';

@Injectable()
class ConversationGroupService implements IParticipantService {
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
            select: 'userName firstName lastName email _id',
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
    const users = await this.userModel
      .find({ _id: { $in: [...unique] } })
      .lean();

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
      .populate('members', 'userName firstName lastName email _id')
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

    const inviter = await this.userModel.find({
      _id: { $in: [...params.idParticipant] },
    });

    return {
      conversation: merge(conversation, {
        participant: {
          ...newParticipant,
          members: newUser.entities,
        },
        updatedAt: newParticipant.updatedAt,
      }),
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

    const banners = await this.userModel
      .find({
        _id: { $in: [...params.idParticipant] },
      })
      .lean();

    return {
      conversation: merge(conversation, {
        participant: {
          ...newParticipant,
          members: newUser.entities,
        },
        updatedAt: newParticipant.updatedAt,
      }),
      newUsers: banners,
    };
  }

  async leave(
    conversationId: string,
    authorId: string,
  ): Promise<Conversation<any>> {
    if (!conversationId) throw new BadRequestException('Id not valid');
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate([populateParticipant, populateLastMessage])
      .lean();
    const participant = <Participant<User>>conversation.participant;
    const memberIndex = participant.members.findIndex(
      (member) => string.getId(member) === authorId,
    );
    if (memberIndex < 0) throw new BadRequestException('You are not in group');
    participant.members.splice(memberIndex, 1);

    const newParticipant = await this.updateParticipant(
      string.getId(participant),
      participant.members.map((member) => string.getId(member)),
      participant.roles,
    );

    return merge(conversation, {
      participant: {
        ...newParticipant,
        members: participant.members,
      },
      updatedAt: newParticipant.updatedAt,
    });
  }
}

export default ConversationGroupService;
