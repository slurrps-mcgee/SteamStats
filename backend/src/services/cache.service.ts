import { LRUCache } from 'lru-cache';
import fs from 'node:fs/promises';
import path from 'node:path';

type PersistedEntry = {
  value: unknown;
  expiresAt: number | null;
};

function isPersistedEntry(value: unknown): value is PersistedEntry {
  if (typeof value !== 'object' || value === null || !('value' in value)) {
    return false;
  }
  const expiresAt = (value as PersistedEntry).expiresAt;
  return expiresAt === null || typeof expiresAt === 'number';
}

class CacheService {
  private readonly cache: LRUCache<string, any>;
  private readonly inflight = new Map<string, Promise<unknown>>();

  private readonly filePath = path.join(process.cwd(), 'cache.json');

  constructor() {
    this.cache = new LRUCache<string, any>({
      max: 1000,
      allowStale: false,
      updateAgeOnGet: true,
    });
  }

  async load() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const entries = JSON.parse(data) as Record<string, unknown>;
      const now = Date.now();
      let loaded = 0;

      for (const [key, raw] of Object.entries(entries)) {
        if (!isPersistedEntry(raw)) {
          continue;
        }

        if (raw.expiresAt === null) {
          this.cache.set(key, raw.value, { ttl: Infinity });
          loaded += 1;
          continue;
        }

        const remaining = raw.expiresAt - now;
        if (remaining <= 0) {
          continue;
        }

        this.cache.set(key, raw.value, { ttl: Math.max(1, remaining) });
        loaded += 1;
      }

      console.log(`Loaded ${loaded} cached entries`);
    } catch {
      console.log('No cache file found, starting empty');
    }
  }

  async save() {
    const entries: Record<string, PersistedEntry> = {};
    const now = Date.now();

    for (const [key, value] of this.cache.entries()) {
      const remaining = this.cache.getRemainingTTL(key);
      if (remaining === 0) {
        continue;
      }

      entries[key] = {
        value,
        expiresAt: remaining === Infinity ? null : now + remaining,
      };
    }

    await fs.writeFile(this.filePath, JSON.stringify(entries), 'utf8');
    console.log(`Saved ${Object.keys(entries).length} cached entries`);
  }

  async remember<T>(key: string, ttl: number | undefined, loader: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);

    if (cached !== undefined) {
      return cached as T;
    }

    const pending = this.inflight.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    const request = (async () => {
      const value = await loader();
      this.cache.set(key, value, ttl ? { ttl } : { ttl: Infinity });
      return value;
    })().finally(() => {
      this.inflight.delete(key);
    });

    this.inflight.set(key, request);
    return request as Promise<T>;
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  set<T>(key: string, value: T, ttl?: number) {
    this.cache.set(key, value, ttl ? { ttl } : { ttl: Infinity });
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  async clear() {
    this.cache.clear();

    try {
      await fs.unlink(this.filePath);
      console.log('Cache cleared');
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

export default CacheService;
