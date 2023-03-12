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

  private async getParticipantByUsers(ids: string[]) {
    const users = await this.userModel.find({ _id: { $in: ids } });
    if (users.length === 0 || users.length !== ids.length) {
      throw new BadRequestException('Users not found');
    }
    const entity = mapToEntities(users);
    const participant = await this.participantModel
      .findOne({
        members: { $all: entity.ids },
      })
      .populate('members', 'firstName lastName email');

    return { participant, newUser: entity };
  }

  private async findConversationById(id: string): Promise<Conversation> {
    if (!id) throw new BadRequestException('Id not valid');
    const result = await (
      await this.conversationModel.findById(id)
    ).populate([
      {
        path: 'lastMessage',
        select: 'content author _id createdAt',
        populate: {
          path: 'author',
          select: 'firstName lastName email _id',
        },
      },
    ]);
    if (!result) throw new BadRequestException('Conversation not found');
    return result.toObject();
  }

  async addMoreMembers(
    conversationId: string,
    params: ConversationCreateParams,
  ): Promise<Conversation> {
    const conversation = await this.findConversationById(conversationId);
    const participant = await this.participantModel.findById(
      conversation.participant,
    );
    const unique = new Set<string>([
      ...participant.members,
      ...params.idParticipant,
    ]);

    const { participant: currentParticipant, newUser } =
      await this.getParticipantByUsers([...unique]);
    if (currentParticipant) {
      throw new BadRequestException('Exits conversation');
    }
    participant.members = newUser.ids;
    participant.roles = newUser.ids.reduce((acc, obj) => {
      acc[string.getId(obj)] = 'Member';
      return acc;
    }, {});
    await participant.save();
    return {
      ...conversation,
      participant: {
        ...(participant as any).toObject(),
        members: newUser.entities,
      },
    };
  }
}
