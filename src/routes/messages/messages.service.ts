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

  private validConversation(conversation: Conversation, participantId: string) {
    const { author, participant } = conversation;

    if (author !== participantId && participant !== participantId) {
      throw new ForbiddenException('Messenger failure');
    }
  }

  private async getConversationByID(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('participant');

    if (!conversation) throw new BadRequestException('Conversation not found');

    if (!conversation.author || !conversation.participant) {
      throw new InternalServerErrorException();
    }
    return conversation;
  }

  async getMessages(
    conversationId: string,
    { limit, bucket }: PaginationOption,
  ): Promise<Pagination<IMessage>> {
    const data = await this.messageModel
      .find({ conversationId }, {}, { sort: { createdAt: 'desc' } })
      .populate('author', 'firstName lastName');

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
    this.validConversation(conversation, params.author);

    const message = await this.messageModel.create({
      conversationId: conversationId,
      content: content,
      author: author,
    });

    conversation.lastMessage = string.getId(message);
    const [_, messageFull] = await Promise.all([
      conversation.save(),
      message.populate('author', 'firstName lastName email'),
    ]);

    return {
      message: messageFull.toObject(),
      members: members
        .add(author)
        .add(conversation.author.toString())
        .add(conversation.participant.toString()),
    };
  }

  async deleteMessage(
    params: MessageDeleteParams,
  ): Promise<ResponseMessageWithLastMessage> {
    const members = new Set<string>();
    const { conversationId, userId, messageId } = params;
    const conversation = await this.getConversationByID(conversationId);
    const message = await this.messageModel.findByIdAndDelete(messageId);

    if (!message) throw new BadRequestException('Message not found');

    let lastMessage: IMessage = null;

    if (conversation.lastMessage === messageId) {
      const messages = await this.messageModel
        .find({ conversationId })
        .sort({ createdAt: 'desc' })
        .limit(1)
        .lean();
      conversation.lastMessage =
        messages.length !== 0 ? string.getId(messages[0]) : undefined;
      lastMessage = messages.length !== 0 ? <IMessage>messages[0] : undefined;
      await conversation.save();
    }

    (<Participant<User>>conversation.participant).members.forEach((member) =>
      members.add(string.getId(member)),
    );

    return {
      message: message?.toObject(),
      lastMessage: lastMessage,
      members: members.add(userId).add(conversation.author.toString()),
    };
  }

  async editContentMessage(
    params: MessageEditParams,
  ): Promise<ResponseMessageWithLastMessage> {
    const members = new Set<string>();
    const { conversationId, userId, messageId } = params;
    const conversation = await this.getConversationByID(conversationId);
    const message = await this.messageModel.findByIdAndUpdate(
      messageId,
      { content: params.content },
      { new: true },
    );

    if (!message) throw new BadRequestException('Message not found');
    let lastMessage: IMessage = null;

    if (conversation.lastMessage === messageId) {
      lastMessage = <IMessage>message;
    }

    (<Participant<User>>conversation.participant).members.forEach((member) =>
      members.add(string.getId(member)),
    );

    return {
      message: message?.toObject(),
      lastMessage: lastMessage,
      members: members.add(userId).add(conversation.author.toString()),
    };
  }
}
