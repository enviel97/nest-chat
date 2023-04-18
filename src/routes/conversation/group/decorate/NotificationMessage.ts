import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Event, ModelName } from 'src/common/define';
import type { MessageDocument } from 'src/models/messages';

export interface MessageCreateSystemParams {
  conversationId: string;
  participant: User[];
}

const createContentSystem = (
  action: MessageType,
  author: User,
  participant: User[],
) => {
  switch (action) {
    case 'invite':
      return `${participant
        .map((user) => user.firstName)
        .join(', ')} has been add by ${author.firstName}`;
    case 'banned':
      return `${participant
        .map((user) => user.firstName)
        .join(', ')} has been banned by ${author.firstName}`;

    case 'leave':
      return `${author.firstName} leave group`;
  }
};

export const NotificationMessage = (action: MessageType) => {
  const messageModelInject = InjectModel(ModelName.Message);
  const userInject = Inject(REQUEST);
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    try {
      const originalMethod = descriptor.value;
      messageModelInject(target, 'messageModel');
      userInject(target, 'author');
      descriptor.value = async function (...args: any) {
        const messageModel: MessageDocument = this.messageModel;
        const author: User = this.author;
        const [conversationId] = args;
        const result = await originalMethod.call(this, args);

        const content = createContentSystem(action, author, result);
        const message = await messageModel.create({
          conversationId: conversationId,
          content: content,
          author: author.getId(),
          action: 'Notice',
        });

        this.eventEmitter.emit(Event.EVENT_MESSAGE_SENDING, message);
      };
    } catch (err) {
      Logger.error(err, 'NotificationMessage:::Reason');
      throw new InternalServerErrorException();
    }
  };
};
