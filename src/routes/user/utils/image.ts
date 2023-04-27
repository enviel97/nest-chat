import { v5 as uuid, v4 as namespace } from 'uuid';
export const imageGenerationUID = (base: string, nameSpace: string) => {
  const MY_NAMESPACE = namespace();
  return uuid(`${nameSpace}$${base}`, MY_NAMESPACE);
};
