import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { CacheModel } from 'src/common/cache';
import { ModelName } from 'src/common/define';
import ModelCache from 'src/middleware/cache/decorates/ModelCache';
import ModelUpdate from 'src/middleware/cache/decorates/ModelUpdate';
import { ConversationDocument } from 'src/models/conversations';
import { UserDocument } from 'src/models/users';
import { mapToMapEntities } from 'src/utils/map';
import { ConversationNotFoundException } from '../exception/conversation.exception';
import { ParticipantMemberNotFoundException } from '../exception/conversation.group.exception';
import { populateLastMessage, populateMember } from '../utils/config';
import { CheckPermissionModifyConversation } from './decorate/checkPermission';

@Injectable()
class ConversationGroupService implements IGroupConversationServices {
  constructor(
    @InjectModel(ModelName.User)
    private readonly userModel: UserDocument,
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,
  ) {}

  private readonly ADD_ACTION_EXCEPTION = 'Some users are already in the group';
  private readonly REMOVE_ACTION_EXCEPTION = 'Some users are not in the group';

  private async validateMembers(
    members: string[],
    targets: string[],
    action: ConversationGroupAction,
  ) {
    // Valid on case
    if (action === 'Add' && targets.isSubsetOf(members)) {
      throw new ParticipantMemberNotFoundException(this.ADD_ACTION_EXCEPTION);
    }
    if (action === 'Remove' && !targets.isSubsetOf(members)) {
      throw new ParticipantMemberNotFoundException(
        this.REMOVE_ACTION_EXCEPTION,
      );
    }

    // All ids is valid
    const unique = new Set<string>([...members, ...targets]);
    const memberUsers = await this.userModel
      .find({ _id: { $in: [...unique] } })
      .lean();
    if (memberUsers.length !== unique.size) {
      throw new ParticipantMemberNotFoundException();
    }
    const { entities } = mapToMapEntities<User>(memberUsers);
    return targets.map(entities.get);
  }

  @ModelCache({ modelName: CacheModel.CONVERSATION })
  private async getConversation(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .lean();
    if (!conversation) throw new ConversationNotFoundException();
    return conversation;
  }

  @ModelUpdate({ modelName: CacheModel.MESSAGE_CONVERSATION, keyIndex: [0] })
  @ModelUpdate({ modelName: CacheModel.CONVERSATION, keyIndex: [0] })
  private async updateParticipant(
    conversationId: string,
    target: string[],
    action: ConversationGroupAction,
  ): Promise<Conversation<User>> {
    let queries: UpdateQuery<Conversation<string>>;
    switch (action) {
      case 'Add': {
        queries = {
          $addToSet: { 'participant.members': { $each: target } },
          $set: target.reduce<ParticipantRole>((roles, id) => {
            return { ...roles, [`participant.roles.${id}`]: 'Member' };
          }, {}),
        };
        break;
      }
      case 'Remove': {
        queries = {
          $pull: { 'participant.members': { $in: target } },
          $unset: target.reduce((roles, id) => {
            return { ...roles, [`participant.roles.${id}`]: '' };
          }, {}),
        };
        break;
      }
    }
    const conversation = await this.conversationModel
      .findByIdAndUpdate(conversationId, queries, { new: true })
      .lean()
      .populate([populateMember, populateLastMessage]);

    return conversation;
  }

  @CheckPermissionModifyConversation(['Admin'])
  async addMoreMembers(
    conversationId: string,
    inviterIds: string[],
  ): Promise<ResponseModified> {
    const conversation = await this.getConversation(conversationId);
    const members = conversation.participant.members;
    const targetUsers = await this.validateMembers(members, inviterIds, 'Add');
    const updatedConversation = await this.updateParticipant(
      conversationId,
      inviterIds,
      'Add',
    );
    return {
      conversation: updatedConversation,
      newUsers: targetUsers,
    };
  }

  @CheckPermissionModifyConversation(['Admin'])
  async removeMoreMembers(
    conversationId: string,
    bannedIds: string[],
  ): Promise<ResponseModified> {
    const conversation = await this.getConversation(conversationId);
    const members = conversation.participant.members;
    const targetUsers = await this.validateMembers(
      members,
      bannedIds,
      'Remove',
    );
    const updatedConversation = await this.updateParticipant(
      conversationId,
      bannedIds,
      'Remove',
    );

    return {
      conversation: updatedConversation,
      newUsers: targetUsers,
    };
  }

  @CheckPermissionModifyConversation(['Member'])
  async leave(
    conversationId: string,
    authorId: string,
  ): Promise<Conversation<any>> {
    const conversation = await this.getConversation(conversationId);
    const members = conversation.participant.members;
    await this.validateMembers(members, [authorId], 'Remove');
    const updatedConversation = await this.updateParticipant(
      conversationId,
      [authorId],
      'Remove',
    );

    return updatedConversation;
  }
}

export default ConversationGroupService;
