interface ICacheService {
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
  get<T = any>(key: string): Promise<T>;
  del(key: string): Promise<void>;
  delP(pattern: string): Promise<void>;
  update<T = any>(
    key: string,
    value: T,
    ttl?: number,
    shallow?: boolean,
  ): Promise<boolean>;
}
