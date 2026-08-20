import { beforeEach, describe, expect, it, vi } from 'vitest';

const { readFile, writeFile, unlink } = vi.hoisted(() => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: { readFile, writeFile, unlink },
  readFile,
  writeFile,
  unlink,
}));

import CacheService from '../../services/cache.service';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new CacheService();
  });

  it('stores and retrieves values', () => {
    cache.set('a', { n: 1 });
    expect(cache.get('a')).toEqual({ n: 1 });
    cache.delete('a');
    expect(cache.get('a')).toBeUndefined();
  });

  it('remember returns cached value without calling loader again', async () => {
    const loader = vi.fn().mockResolvedValue('first');

    await expect(cache.remember('k', 60_000, loader)).resolves.toBe('first');
    await expect(cache.remember('k', 60_000, loader)).resolves.toBe('first');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('remember dedupes inflight loaders', async () => {
    let resolveLoader!: (value: string) => void;
    const loader = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveLoader = resolve;
        }),
    );

    const first = cache.remember('inflight', 60_000, loader);
    const second = cache.remember('inflight', 60_000, loader);

    resolveLoader('shared');
    await expect(Promise.all([first, second])).resolves.toEqual(['shared', 'shared']);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('load restores valid unexpired entries and skips bad or expired ones', async () => {
    const now = Date.now();
    readFile.mockResolvedValue(
      JSON.stringify({
        forever: { value: 1, expiresAt: null },
        fresh: { value: 2, expiresAt: now + 60_000 },
        expired: { value: 3, expiresAt: now - 1 },
        invalid: { expiresAt: 'nope' },
      }),
    );

    await cache.load();

    expect(cache.get('forever')).toBe(1);
    expect(cache.get('fresh')).toBe(2);
    expect(cache.get('expired')).toBeUndefined();
    expect(cache.get('invalid')).toBeUndefined();
  });

  it('load starts empty when the cache file is missing', async () => {
    readFile.mockRejectedValue(new Error('ENOENT'));
    await cache.load();
    expect(cache.get('anything')).toBeUndefined();
  });

  it('save writes current entries to disk', async () => {
    cache.set('a', 'value');
    writeFile.mockResolvedValue(undefined);

    await cache.save();

    expect(writeFile).toHaveBeenCalledOnce();
    const [, payload] = writeFile.mock.calls[0];
    const parsed = JSON.parse(payload as string) as Record<string, { value: string }>;
    expect(parsed.a.value).toBe('value');
  });

  it('clear empties memory and deletes the file', async () => {
    cache.set('a', 1);
    unlink.mockResolvedValue(undefined);

    await cache.clear();

    expect(cache.get('a')).toBeUndefined();
    expect(unlink).toHaveBeenCalledOnce();
  });

  it('clear ignores missing cache file', async () => {
    const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
    unlink.mockRejectedValue(missing);

    await expect(cache.clear()).resolves.toBeUndefined();
  });

  it('clear rethrows unexpected unlink errors', async () => {
    unlink.mockRejectedValue(new Error('permission denied'));
    await expect(cache.clear()).rejects.toThrow('permission denied');
  });
});
