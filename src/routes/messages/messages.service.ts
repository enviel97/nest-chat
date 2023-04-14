import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from 'src/common/define';
import { ConversationDocument } from 'src/models/conversations';
import { MessageDocument } from 'src/models/messages';
import string from 'src/utils/string';

@Injectable()
export class MessagesService implements IMessengerService {
  constructor(
    @InjectModel(ModelName.Conversation)
    private readonly conversationModel: ConversationDocument,

    @InjectModel(ModelName.Message)
    private readonly messageModel: MessageDocument,
  ) {}

  private validConversation(
    participant: Participant<string>,
    participantId: string,
  ) {
    if (participant.members.indexOf(participantId) < 0) {
      throw new ForbiddenException('Messenger failure');
    }
  }

  private async getConversationByID(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('participant')
      .lean();

    if (!conversation) throw new BadRequestException('Conversation not found');

    if (!conversation.participant) {
      throw new InternalServerErrorException();
    }
    return conversation;
  }

  async getMessages(
    conversationId: string,
    { limit, bucket }: PaginationOption,
  ): Promise<Pagination<IMessage>> {
    await this.getConversationByID(conversationId);
    const data = await this.messageModel
      .find({ conversationId }, {}, { sort: { createdAt: 'desc' } })
      .populate('author', 'firstName lastName userName')
      .lean();

    return {
      total: data.length,
      bucket: bucket,
      limit: limit,
      data: data.splice(Math.max(bucket - 1, 0), limit) as IMessage[],
    };
  }

  async createMessage(params: MessageCreateParams): Promise<ResponseMessage> {
    const members = new Set<string>();
    const { conversationId, content, author } = params;
    const conversation = await this.getConversationByID(conversationId);
    if (params.action !== 'Notice') {
      this.validConversation(
        <Participant<string>>conversation.participant,
        params.author,
      );
    }

    const message = await this.messageModel.create({
      conversationId: conversationId,
      content: content,
      author: author,
      action: params.action ?? 'New',
    });

    const [_, messageFull] = await Promise.all([
      new Promise(async (resolve) => {
        if (params.action === 'Notice') return;
        const conversationUpdate = await this.conversationModel
          .findByIdAndUpdate(conversation.getId(), {
            lastMessage: message.getId(),
          })
          .lean();
        resolve(conversationUpdate);
      }),
      message.populate('author', 'firstName lastName email userName'),
    ]);
    (<Participant<User>>conversation.participant).members.forEach((member) =>
      members.add(string.getId(member)),
    );

    return {
      message: messageFull.toObject(),
      members: members.add(author).add(conversation.participant.toString()),
    };
  }

  async editContentMessage(
    params: MessageEditParams,
  ): Promise<ResponseMessageWithLastMessage> {
    const members = new Set<string>();
    const {
      conversationId,
      userId,
      messageId,
      action = 'Edited',
      content,
    } = params;
    const conversation = await this.getConversationByID(conversationId);
    const message = await this.messageModel
      .findByIdAndUpdate(messageId, { content, action }, { new: true })
      .lean();

    if (!message) throw new BadRequestException('Message not found');
    let lastMessage: IMessage = null;

    if (conversation.lastMessage === messageId) {
      lastMessage = <IMessage>message;
    }

    (<Participant<User>>conversation.participant).members.forEach((member) =>
      members.add(string.getId(member)),
    );

    return {
      message: <IMessage>message,
      lastMessage: lastMessage,
      members: members.add(userId),
    };
  }
}
