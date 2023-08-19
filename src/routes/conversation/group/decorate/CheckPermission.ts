import { BadRequestException, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Services } from 'src/common/define';
import string from 'src/utils/string';

async function checkPermission(
  target: any,
  conversationId: string,
  user: string,
  roleAllow: Role[],
) {
  if (!conversationId) throw new BadRequestException('Id not valid');
  const conversation = await target.conversationModel
    .findById(conversationId)
    .lean();
  if (!conversation) throw new BadRequestException('Conversation not found');
  const participant = await target.participantModel
    .findById(conversation.participant)
    .lean();
  if (!roleAllow.includes(participant.roles[user])) {
    throw new BadRequestException("You don't have permission");
  }
}

/**
 * Check permission is allow modify
 * @param ttl as milliseconds
 * @returns
 */
export const CheckPermissionModifyConversation = (
  role: Role[],
  ttl?: number,
) => {
  // This will get all params
  const requestInject = Inject(REQUEST);
  const _ttl = ttl ?? 24 * 60 * 60;
  const cacheInject = Inject(Services.CACHE);
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    requestInject(target, 'request');
    cacheInject(target, 'cacheService');
    const originalMethod = descriptor.value;
    // Check permission function
    descriptor.value = async function (...args: any[]) {
      const [conversationId, _] = args;
      const authorId = string.getId(this.request.user);
      const validateKey = `Validate:PermissionConversationModify:${conversationId}_${authorId}`;
      const cache: ICacheService = this.cacheService;
      if (!cache) {
        await checkPermission(this, conversationId, authorId, role);
        return await originalMethod.call(this, ...args);
      }
      const cacheData = await cache.get(validateKey);
      if (cacheData || cacheData === 'Confirm') {
        return await originalMethod.call(this, ...args);
      }
      await checkPermission(this, conversationId, authorId, role);
      await cache.set(validateKey, 'Confirm', _ttl); //TTL in once day

      return await originalMethod.call(this, ...args);
    };
  };
};
