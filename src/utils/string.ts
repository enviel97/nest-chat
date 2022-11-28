import { Types } from 'mongoose';

const cvtToObjectId = (plainText: string) => {
  try {
    return new Types.ObjectId(plainText);
  } catch (error) {
    return;
  }
};

const getId = (object: Identity) => {
  return object?.id ?? object._id;
};

export default { cvtToObjectId, getId };
