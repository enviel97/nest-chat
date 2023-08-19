import { Inject } from '@nestjs/common';
import { Services } from 'src/common/define';
import generateKeyByParams from '../utils/generateKeyByParams';

interface ModelCacheProps {
  modelName: string;
  ttl?: number;
  keyIndex?: number[];
}
const ModelCache = ({
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

      const key = generateKeyByParams([...args], { keyIndex });
      const modalKey = `${modelName}:${key}`;
      const cacheData = await cache.get(modalKey);
      if (cacheData) return cacheData;

      const value = await originalMethod.call(this, ...args);
      await cache.set(modalKey, value, ttl); // TTL in once day
      return value;
    };
  };
};

export default ModelCache;
