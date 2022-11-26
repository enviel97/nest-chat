import { Types } from 'mongoose';

const cvtToObjectId = (plainText: string) => {
  try {
    return new Types.ObjectId(plainText);
  } catch (error) {
    return;
  }
};

export default { cvtToObjectId };
