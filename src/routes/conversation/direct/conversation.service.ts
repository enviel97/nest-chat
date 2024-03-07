import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { ConversationDocument } from 'src/models/conversations';
import { UserDocument } from 'src/models/users';
import { populateLastMessage, populateMember } from '../utils/config';
import {
  createNameConversation,
  createRoles,
} from '../utils/create.conversation';
import { CreateConversationException } from '../exception/conversation.exception';

@Injectable()
class ConversationService implements IConversationsService {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,
  ) {}

  private async createNewConversation(author: User, members: string[]) {
    const type: ConversationType = members.length > 2 ? 'group' : 'direct';
    const name = createNameConversation(author, { type: type });
    const roles = createRoles(members, author.getId());

    const newConversation = await this.conversationModel.create({
      participant: { members, roles },
      type: type,
      name: name,
    });

    return newConversation.toObject();
  }

  async createConversation({
    creator,
    idParticipant,
  }: ConversationCreateParams) {
    const unique = new Set<string>([...idParticipant]);
    const users = await this.userModel
      .find({ _id: { $in: [...unique] } }, 'firstName lastName email profile')
      .populate({ path: 'profile', select: 'displayName avatar' })
      .lean();
    if (users.length === 0 || users.length !== unique.size) {
      throw new CreateConversationException('Users not found');
    }
    const author = users.find((user) => user.isSame(creator));
    const conversation = await this.conversationModel
      .findOne({
        'participant.members': {
          $all: [...unique],
          $size: idParticipant.length,
        },
      })
      .populate([populateMember, populateLastMessage])
      .lean();
    if (conversation) return conversation;
    const newConversation = await this.createNewConversation(
      author,
      idParticipant,
    );

    return {
      ...newConversation,
      participant: {
        ...(newConversation.participant as any),
        members: users,
      },
    };
  }

  async getConversations(authorId: string, options: GetConversationsOption) {
    if (!authorId) throw new BadRequestException();
    const { type, limit, bucket } = options;
    const conversations = await this.conversationModel
      .find(
        { type, 'participant.members': authorId },
        {},
        { sort: { updatedAt: -1 }, limit, skip: bucket * limit },
      )
      .populate([populateMember, populateLastMessage])
      .lean();
    return conversations;
  }
}

export default ConversationService;
