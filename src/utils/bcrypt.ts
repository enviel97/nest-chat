import * as bcrypt from 'bcrypt';

export const hash = async (plaintext: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(plaintext, salt);
};

export const compare = (plainText: string, hash: string) => {
  return bcrypt.compareSync(plainText, hash);
};
