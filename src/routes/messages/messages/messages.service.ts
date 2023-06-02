import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName, Services } from 'src/common/define';
import { MessageDocument } from 'src/models/messages';
import { LogDuration } from 'src/utils/decorates';
import { MessagesCreateException } from '../utils/messages.exception';

@Injectable()
export class MessagesService implements IMessengerService {
  constructor(
    @InjectModel(ModelName.Message)
    private readonly messageModel: MessageDocument,

    @Inject(Services.ATTACHMENTS)
    private readonly attachmentService: IAttachmentServices,
  ) {}

  async getMessages(
    conversationId: string,
    { limit, bucket }: PaginationOption,
  ): Promise<Pagination<IMessage>> {
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

  @LogDuration()
  async createMessage(params: MessageCreateParams): Promise<Message> {
    const {
      conversationId,
      content,
      author,
      attachments,
      action = 'New',
    } = params;
    if (!content && attachments?.isEmpty()) {
      throw new MessagesCreateException();
    }

    let cloudinaries = undefined;
    if (attachments?.length ?? 0 !== 0) {
      cloudinaries = await this.attachmentService.creates(attachments);
    }
    const message = await this.messageModel.create({
      conversationId: conversationId,
      content: content,
      author: author.getId(),
      attachments: cloudinaries,
      action: action,
    });
    return {
      ...message.toObject(),
      author: params.author,
    };
  }

  async editContentMessage(params: MessageEditParams): Promise<Message> {
    const { messageId, action = 'Edited', content } = params;

    const message = await this.messageModel
      .findByIdAndUpdate(messageId, { content, action }, { new: true })
      .lean();

    if (!message) throw new BadRequestException('Message not found');
    if (action === 'Removed' && !message.attachments.isEmpty()) {
      this.attachmentService.deletes(message.attachments);
      await this.messageModel
        .findByIdAndUpdate(messageId, { attachments: [] })
        .lean();
    }
    return message;
  }
}
