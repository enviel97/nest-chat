import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { ConversationDocument } from 'src/models/conversations';
import { ParticipantDocument } from 'src/models/participants';
import { UserDocument } from 'src/models/users';
import { mapToEntities } from 'src/utils/map';
import string from 'src/utils/string';
import { populateLastMessage, populateParticipant } from '../utils/config';

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

  private async getParticipantByUsers(ids: string[]) {
    const users = await this.userModel.find({ _id: { $in: ids } });
    if (users.length === 0 || users.length !== ids.length) {
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
      .populate('members', 'firstName lastName email')
      .lean();

    return { participant, newUser: entity };
  }

  private createRoles(ids: string[], adminId: string) {
    const roles = ids.reduce((acc, obj) => {
      const isAdmin = string.getId(obj) === adminId;
      acc[string.getId(obj)] = isAdmin ? 'Admin' : 'Member';
      return acc;
    }, {});
    return roles;
  }

  private createType(ids: Set<string>) {
    const type: ConversationType = ids.size > 2 ? 'group' : 'direct';
    return type;
  }

  async createConversation(conversationDTO: ConversationCreateParams) {
    const unique = new Set<string>([...conversationDTO.idParticipant]);
    const { participant, newUser } = await this.getParticipantByUsers([
      ...unique,
    ]);

    if (!participant) {
      const roles = this.createRoles(newUser.ids, conversationDTO.creator);
      const type = this.createType(unique);
      const newParticipant = await this.participantModel.create({
        members: newUser.ids,
        roles: roles,
      });
      const model = await this.conversationModel.create({
        participant: string.getId(newParticipant),
        type: type,
      });
      return {
        ...model.toObject(),
        participant: { ...participant, members: newUser.entities },
      };
    }

    const conversation = await this.conversationModel
      .findOne({ participant: string.getId(participant) })
      .populate([populateParticipant, populateLastMessage])
      .lean();
    return conversation;
  }

  async getConversations(authorId: string, options: GetConversationsOption) {
    if (!authorId) throw new BadRequestException();
    const { type } = options;
    const { ids } = mapToEntities(
      await this.participantModel.find({ members: authorId }),
    );
    return await this.conversationModel
      .find(
        { participant: { $in: ids }, type: type },
        {},
        { sort: { updatedAt: -1 } },
      )
      .populate([populateParticipant, populateLastMessage])
      .lean();
  }
}
