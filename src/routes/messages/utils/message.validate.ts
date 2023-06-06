import { isMongoId, isNotEmpty } from 'class-validator';

export const validateObjectId = (conversationId: string) => {
  return isNotEmpty(conversationId) && isMongoId(conversationId);
};
