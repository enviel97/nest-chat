import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CacheModel } from 'src/common/cache';
import { ModelName } from 'src/common/define';
import ModelCache from 'src/middleware/cache/decorates/ModelCache';
import ModelUpdate from 'src/middleware/cache/decorates/ModelUpdate';
import { ConversationDocument } from 'src/models/conversations';
import { ParticipantDocument } from 'src/models/participants';
import { UserDocument } from 'src/models/users';
import { mapToEntities, merge } from 'src/utils/map';
import string from 'src/utils/string';
import {
  populateLastMessage,
  populateMember,
  populateParticipant,
} from '../utils/config';
import { CheckPermissionModifyConversation } from './decorate/checkPermission';

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

  private async getUsersById(ids: string[]) {
    const unique = new Set<string>(ids);
    const users = await this.userModel
      .find({ _id: { $in: [...unique] } })
      .lean();

    if (users.length === 0 || users.length !== unique.size) {
      throw new BadRequestException('Users not found');
    }
    const participant = await this.participantModel
      .findOne({ members: { $size: unique.size, $all: [...unique] } })
      .lean();

    if (participant) throw new BadRequestException('Exits conversation');

    return mapToEntities(users);
  }

  @ModelCache({ modelName: CacheModel.CONVERSATION })
  private async getConversation(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate([populateParticipant, populateLastMessage])
      .lean();
    return conversation;
  }

  @ModelUpdate({ modelName: CacheModel.MESSAGE_CONVERSATION })
  @ModelUpdate({ modelName: CacheModel.CONVERSATION })
  private async updateParticipant(
    id: string,
    members: string[],
    roles: ParticipantRole,
  ) {
    const _roles = members.reduce((acc, id) => {
      acc[id] = roles[id] ?? 'Member';
      return acc;
    }, {});

    const newParticipant = await this.participantModel
      .findByIdAndUpdate(id, { members, roles: _roles }, { new: true })
      .populate(populateMember)
      .lean();

    return {
      participant: newParticipant,
      updatedAt: newParticipant.updatedAt,
    };
  }

  @CheckPermissionModifyConversation(['Admin'])
  async addMoreMembers(
    conversationId: string,
    inviterIds: string[],
  ): Promise<ResponseModified> {
    const conversation = await this.getConversation(conversationId);
    const participant = conversation.participant as Participant<User>;
    const { entities, ids } = await this.getUsersById([
      ...participant.members.map<string>(string.getId),
      ...inviterIds,
    ]);

    const [{ participant: newParticipant }, inviter] = await Promise.all([
      this.updateParticipant(string.getId(participant), ids, participant.roles),
      this.userModel.find({ _id: { $in: [...inviterIds] } }),
    ]);

    return {
      conversation: merge(conversation, {
        participant: {
          ...newParticipant,
          members: entities,
        },
      }),
      newUsers: inviter,
    };
  }

  @CheckPermissionModifyConversation(['Admin'])
  async removeMoreMembers(
    conversationId: string,
    bannedIds: string[],
  ): Promise<ResponseModified> {
    const conversation = await this.getConversation(conversationId);
    const participant = conversation.participant as Participant<User>;
    const ids: string[] = participant.members.reduce((ids, member) => {
      if (!bannedIds.includes(member.getId())) {
        ids.push(member.getId());
      }
      return ids;
    }, [] as string[]);

    if (participant.members.length - ids.length !== bannedIds.length)
      throw new BadRequestException("Can't found user in current conversation");

    const newUser = await this.getUsersById(ids);

    const [{ participant: newParticipant }, banners] = await Promise.all([
      this.updateParticipant(
        string.getId(participant),
        newUser.ids,
        participant.roles,
      ),
      this.userModel.find({ _id: { $in: [...bannedIds] } }).lean(),
    ]);

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

  @CheckPermissionModifyConversation(['Admin', 'Member'])
  async leave(
    conversationId: string,
    authorId: string,
  ): Promise<Conversation<any>> {
    const conversation = await this.getConversation(conversationId);
    const participant = <Participant<User>>conversation.participant;
    const memberIndex = participant.members.findIndex(
      (member) => string.getId(member) === authorId,
    );
    if (memberIndex < 0) throw new BadRequestException('You are not in group');
    participant.members.splice(memberIndex, 1);

    const { participant: newParticipant } = await this.updateParticipant(
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

  async getParticipants(participants: string[]): Promise<Participant<any>> {
    const participant = await this.participantModel
      .findOne({
        members: {
          $all: participants,
          $size: participants.length,
        },
      })
      .lean();
    return participant;
  }
}

export default ConversationGroupService;
