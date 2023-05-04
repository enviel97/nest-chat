import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CacheModel } from 'src/common/cache';
import { ModelName } from 'src/common/define';
import ModelCache from 'src/middleware/cache/decorates/ModelCache';
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
  @ModelCache({ modelName: CacheModel.MESSAGE_CONVERSATION })
  private async getConversationByID(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('participant')
      .lean();
    return conversation;
  }

  async getMessages(
    conversationId: string,
    { limit, bucket }: PaginationOption,
  ): Promise<Pagination<IMessage>> {
    await this.getConversationByID(conversationId);
    const data = await this.messageModel
      .find(
        { conversationId },
        {},
        {
          sort: { createdAt: 'desc' },
          limit: limit,
          skip: bucket * limit,
        },
      )
      .populate({
        path: 'author',
        select: 'firstName lastName userName profile',
        populate: { path: 'profile', select: 'display avatar' },
      })
      .lean();

    return {
      total: data.length,
      bucket: bucket,
      limit: limit,
      data: data as IMessage[],
    };
  }

  async createMessage(params: MessageCreateParams): Promise<ResponseMessage> {
    const members = new Set<string>();
    const { conversationId, content, author } = params;
    const conversation = await this.getConversationByID(conversationId);
    const participant = conversation.participant as Participant<User>;
    participant.members.forEach((member) => members.add(string.getId(member)));
    const message = await this.messageModel.create({
      conversationId: conversationId,
      content: content,
      author: author.getId(),
      action: params.action ?? 'New',
    });
    return {
      message: {
        ...message.toObject(),
        author: params.author,
      },
      members: members
        .add(author.getId())
        .add(conversation.participant.toString()),
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
