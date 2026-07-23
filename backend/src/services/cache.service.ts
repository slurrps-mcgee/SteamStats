import { LRUCache } from 'lru-cache';
import fs from 'node:fs/promises';
import path from 'node:path';


class CacheService {

  private readonly cache: LRUCache<string, any>;

  private readonly filePath =
    path.join(process.cwd(), 'cache.json');


  constructor() {
  this.cache = new LRUCache<string, any>({
    max: 1000,
    allowStale: false,
    updateAgeOnGet: true,
  });
}

  async load() {
    try {
      const data =
        await fs.readFile(
          this.filePath,
          'utf8',
        );

      const entries =
        JSON.parse(data);

      for (const [key, value] of Object.entries(entries)) {

        this.cache.set(
          key,
          value,
          {
            ttl: Infinity,
          },
        );
      }

      console.log(
        `Loaded ${this.cache.size} cached entries`,
      );

    } catch (error) {
      console.log(
        'No cache file found, starting empty',
      );
    }
  }

  async save() {
    const entries =
      Object.fromEntries(
        this.cache.entries(),
      );

    await fs.writeFile(
      this.filePath,
      JSON.stringify(entries),
      'utf8',
    );

    console.log(
      `Saved ${this.cache.size} cached entries`,
    );
  }

  async remember<T>(
    key: string,
    ttl: number | undefined,
    loader: () => Promise<T>,
  ): Promise<T> {

    const cached =
      this.cache.get(key);

    if (cached !== undefined) {
      return cached as T;
    }

    const value =
      await loader();

    this.cache.set(
      key,
      value,
      ttl
        ? { ttl }
        : { ttl: Infinity },
    );

    return value;
  }

  get<T>(
    key: string,
  ): T | undefined {
    return this.cache.get(key);
  }

  set<T>(
    key: string,
    value: T,
    ttl?: number,
  ) {
    this.cache.set(
      key,
      value,
      ttl
        ? { ttl }
        : { ttl: Infinity },
    );
  }

  delete(
    key: string,
  ) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}


export default CacheService;