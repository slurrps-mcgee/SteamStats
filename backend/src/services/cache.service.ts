import { LRUCache } from 'lru-cache';

class CacheService {

  private readonly cache: LRUCache<string, any>;

  constructor() {
    this.cache = new LRUCache<string, any>({
      max: 1000,
      ttl: 1000 * 60 * 60,
      allowStale: false,
      updateAgeOnGet: true,
    });
  }


  async remember<T>(
    key: string,
    ttl: number,
    loader: () => Promise<T>
  ): Promise<T> {

    const cached = this.cache.get(key);

    if (cached !== undefined) {
      return cached as T;
    }

    const value = await loader();

    this.cache.set(
      key,
      value,
      { ttl }
    );

    return value;
  }


  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }


  set<T>(
    key: string,
    value: T,
    ttl?: number
  ) {
    this.cache.set(
      key,
      value,
      ttl ? { ttl } : undefined
    );
  }


  delete(key: string) {
    this.cache.delete(key);
  }


  clear() {
    this.cache.clear();
  }
}

export default CacheService;