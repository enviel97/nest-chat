import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { ConversationDocument } from 'src/models/conversations';
import { ParticipantDocument } from 'src/models/participants';
import { UserDocument } from 'src/models/users';
import { mapToEntities, mapToMapEntities } from 'src/utils/map';
import string from 'src/utils/string';
import {
  populateLastMessage,
  populateMember,
  populateParticipant,
} from '../utils/config';
import {
  createNameConversation,
  createRoles,
} from '../utils/create.conversation';
import {
  ConversationNotFoundException,
  CreateConversationException,
} from './conversation.exception';

@Injectable()
class ConversationService implements IConversationsService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
    @InjectModel(ModelName.Participant)
    private readonly participantModel: ParticipantDocument,
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,
  ) {}

  private async createNewConversation(idParticipant: string, newUser: User[]) {
    // type
    const type: ConversationType = newUser.length > 2 ? 'group' : 'direct';

    const name = createNameConversation(newUser, {
      type: type,
    });

    const newConversation = await this.conversationModel.create({
      participant: idParticipant,
      type: type,
      name: name,
    });

    return newConversation.toObject();
  }

  private async createNewParticipant(
    id: string,
    newUser: string[],
    creator: string,
  ) {
    const roles = createRoles(newUser, creator);
    const newParticipant = await this.participantModel.create({
      _id: id,
      members: newUser,
      roles: roles,
    });
    return newParticipant.toObject();
  }

  async createConversation({
    creator,
    idParticipant,
  }: ConversationCreateParams) {
    const unique = new Set<string>([...idParticipant]);
    const users = await this.userModel
      .find({ _id: { $in: [...unique] } }, 'firstName lastName email profile')
      .populate({
        path: 'profile',
        select: 'displayName avatar',
      })
      .lean();

    if (users.length === 0 || users.length !== unique.size) {
      throw new CreateConversationException('Users not found');
    }
    const newUser = mapToEntities(users);
    const participant = await this.participantModel
      .findOne({ members: { $all: newUser.ids } })
      .lean();

    if (!participant) {
      const idParticipant = string.generatorId();
      const [conversation, newParticipant] = await Promise.all([
        this.createNewConversation(idParticipant, newUser.entities),
        this.createNewParticipant(idParticipant, newUser.ids, creator),
      ]);

      return {
        ...conversation,
        participant: {
          ...newParticipant,
          members: newUser.entities,
        },
      };
    }

    const conversation = await this.conversationModel
      .findOne({ participant: string.getId(participant) })
      .populate([populateParticipant, populateLastMessage])
      .lean();
    return conversation;
  }

  private async findParticipant(authorId: string) {
    const result = await this.participantModel
      .find({ members: authorId })
      .populate(populateMember)
      .lean();
    return mapToMapEntities(result, 'members roles');
  }

  private async findConversation(
    ids: string[],
    options: GetConversationsOption,
  ) {
    const { type, limit, bucket } = options;
    const conversations = await this.conversationModel
      .find(
        { participant: { $in: ids }, type: type },
        {},
        { sort: { updatedAt: -1 }, limit, skip: bucket * limit },
      )
      .populate(populateLastMessage)
      .lean();
    return conversations;
  }

  async getConversations(authorId: string, options: GetConversationsOption) {
    if (!authorId) throw new BadRequestException();
    const { ids, entities } = await this.findParticipant(authorId);
    const conversations = await this.findConversation(ids, options);
    return conversations.map((conversation) => {
      return {
        ...conversation,
        participant: entities.get(string.getId(conversation.participant)),
      };
    });
  }

  async findConversationByIds(ids: string[]): Promise<Conversation<any>> {
    const participant = await this.participantModel
      .findOne({ members: { $size: ids.length, $all: ids } })
      .lean();
    if (!participant) throw new ConversationNotFoundException();
    const conversation = await this.conversationModel
      .findById(participant)
      .lean();
    if (!conversation) throw new ConversationNotFoundException();
    return conversation;
  }
}

export default ConversationService;
