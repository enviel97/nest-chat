import string from './string';

export const mapToEntities = <T>(models: T[]): Entity<T> => {
  return {
    ids: models.map((model) => string.getId(model)),
    entities: models,
  };
};
