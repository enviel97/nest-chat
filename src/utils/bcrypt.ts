import * as bcrypt from 'bcrypt';

export const hash = async (plaintext: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(plaintext, salt);
};

export const compare = async (plainText: string, hash: string) => {
  return await bcrypt.compare(plainText, hash);
};
