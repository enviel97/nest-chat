import { Inject } from '@nestjs/common';
import { Services } from 'src/common/define';
import generateKeyByParams from '../utils/generateKeyByParams';

interface ModelCacheProps {
  ttl?: number;
  modelName: string;
  keyIndex?: number[];
  fieldUpdate?: string[];
}
const ModelUpdate = ({
  ttl = 24 * 60 * 60,
  modelName,
  keyIndex,
}: ModelCacheProps) => {
  const cacheInject = Inject(Services.CACHE);
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    cacheInject(target, 'cache');
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cache: ICacheService = this.cache;
      // Normal call
      if (!cache) return await originalMethod.call(this, ...args);
      const key = generateKeyByParams([...args], keyIndex);
      const modalKey = `${modelName}:${key}`;
      const value = await originalMethod.call(this, ...args);
      await cache.update(modalKey, value, ttl);
      return value;
    };
  };
};

export default ModelUpdate;
