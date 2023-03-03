import string from './string';
import { isOk } from './valid';

export const mapToEntities = <T>(models: T[]): Entity<T> => {
  return {
    ids: models.map((model) => string.getId(model)),
    entities: models,
  };
};

export const mapToResponse = <T>(response: IResponse<T>) => {
  const { code, data, message } = response;
  return {
    code,
    message: message || isOk(code) ? 'Response success' : 'Response failure',
    data,
  };
};
