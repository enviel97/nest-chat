import { Types } from 'mongoose';

const cvtToObjectId = (plainText: string) => {
  try {
    return new Types.ObjectId(plainText);
  } catch (error) {
    return;
  }
};

const getId = (object?: any) => {
  if (typeof object === 'string') return object;
  if (!object?.id && !object?._id)
    throw new Error('Object is empty or not have id');
  return (object?.id ?? object?._id).toString();
};

export default { cvtToObjectId, getId };
