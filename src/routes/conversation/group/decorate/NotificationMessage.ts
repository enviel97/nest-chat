import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Event, Services } from 'src/common/define';

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
  const messageServicesInject = Inject(Services.MESSAGES);
  const requestInject = Inject(REQUEST);
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    try {
      const originalMethod = descriptor.value;
      messageServicesInject(target, 'messageServices');
      requestInject(target, 'ctx');
      descriptor.value = async function (...args: any) {
        const messageServices: IMessengerService = this.messageServices;
        const author: User = this.ctx.user;
        const [conversationId] = args;
        const result = await originalMethod.call(this, ...args);
        const content = createContentSystem(action, author, result);
        const message = await messageServices.createMessage({
          conversationId: conversationId,
          content: content,
          author: author,
          action: 'Notice',
        });

        this.eventEmitter.emit(Event.EVENT_MESSAGE_SENDING, message);
      };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  };
};
