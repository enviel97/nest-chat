import string from './string';
import { isOk } from './valid';

export const mapToEntities = <T>(models: T[]): Entity<T> => {
  return {
    ids: models.map((model) => string.getId(model)),
    entities: models,
  };
};

export const mapToMapEntities = <T extends object>(
  models: T[],
  select?: string,
): MapEntity<T> => {
  return models.reduce(
    (mapEntity, currentModel) => {
      mapEntity.ids.push(string.getId(currentModel));
      const entities = select
        ? select.split(' ').reduce((object, name) => {
            if (name in currentModel) {
              object[name] = currentModel[name];
            }
            return object;
          }, {} as T)
        : currentModel;

      mapEntity.entities.set(string.getId(currentModel), entities);
      return mapEntity;
    },
    {
      ids: [],
      entities: new Map<string, T>(),
    },
  );
};

export const mapToResponse = <T>(response: IResponse<T>) => {
  const { code, data, message } = response;
  return {
    code,
    message: message || isOk(code) ? 'Response success' : 'Response failure',
    data,
  };
};

export const merge = <Root extends Object, Part extends Object>(
  root: Root,
  ...parts: Part[]
) => {
  return parts.reduce(
    (root, part) => ({
      ...root,
      ...part,
    }),
    root,
  );
};
