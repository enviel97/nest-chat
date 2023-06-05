import { Inject, InternalServerErrorException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Event2 } from 'src/common/event/event';

const lastMessageValidate = (
  conversation: ConversationMembers,
  message: Message,
) => {
  const { lastMessage } = conversation;
  if (!lastMessage) return false;
  return (
    // message edit is not last message
    (lastMessage.isSame(message) &&
      ['Edited', 'Removed'].includes(message.action)) ||
    // message is new
    message.action === 'New'
  );
};

/**
 *
 * @param {string} eventName name of event emit to socket gateway
 * @returns
 */
export const EmitModifiedMessage = (eventName: string) => {
  const requestInject = Inject(REQUEST);
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    try {
      const originalMethod = descriptor.value;
      requestInject(target, 'ctx');
      descriptor.value = async function (...args: any) {
        const conversation: ConversationMembers = this.ctx.conversation;
        const message = await originalMethod.call(this, ...args);
        const params = { message, conversation };
        this.eventEmitter.emit(eventName, params);
        if (lastMessageValidate(conversation, message)) {
          this.eventEmitter.emit(
            Event2.subscribe.EVENT_MESSAGE_UPDATE_LAST_MESSAGE,
            params,
          );
        }
        return message;
      };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  };
};
