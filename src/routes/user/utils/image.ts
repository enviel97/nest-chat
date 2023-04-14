import { v5 as uuid } from 'uuid';
export const imageGenerationUID = (base: string, nameSpace: string) => {
  const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
  return uuid(`${nameSpace}$${base}`, MY_NAMESPACE);
};
