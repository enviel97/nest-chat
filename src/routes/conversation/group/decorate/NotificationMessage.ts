import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Event, Services } from 'src/common/define';
import { ParticipantModifyException } from '../../exception/conversation.group.exception';

export interface MessageCreateSystemParams {
  conversationId: string;
  participant: User[];
}

const createContentSystem = (
  action: MessageType,
  author: User,
  participant: User[],
) => {
  if (participant.length === 0) throw new ParticipantModifyException();
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
        const content = createContentSystem(
          action,
          author,
          result?.modify ?? [],
        );
        const message = await messageServices.createMessage({
          conversationId: conversationId,
          content: content,
          author: author,
          action: 'Notice',
        });
        const emitPayload = { conversation: result, message };
        this.eventEmitter.emit(Event.EVENT_MESSAGE_SENDING, emitPayload);
        return result;
      };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  };
};
