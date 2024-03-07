import * as bcrypt from 'bcrypt';

export const hash = (plaintext: string) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(plaintext, salt);
};

export const compare = (plainText: string, hash: string) => {
  return bcrypt.compareSync(plainText, hash);
};
