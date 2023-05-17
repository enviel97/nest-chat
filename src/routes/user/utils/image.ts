import { v5 as uuid } from 'uuid';
const NAME_SPACE_FREEZE = 'e0af99f4-d365-4654-af84-99f09f7eab71';
export const imageGenerationUID = (base: string, nameSpace: string) => {
  return uuid(`${nameSpace}$${base}`, NAME_SPACE_FREEZE);
};
