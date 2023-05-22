import { v5 as uuid, v4 as NAME_SPACE_GENERATOR } from 'uuid';
const NAME_SPACE_FREEZE = 'e0af99f4-d365-4654-af84-99f09f7eab71';
export const imageGenerationUID = (prefix: string, unique?: boolean) => {
  const key = !!unique ? NAME_SPACE_GENERATOR() : NAME_SPACE_FREEZE;
  return uuid(`${prefix}`, key);
};
