import { Injectable, inject, signal } from '@angular/core';
import type { SteamGameDetails } from '../interfaces/api';
import { Api } from '../api/generated/api';
import { getGameDetails } from '../api/generated/functions';

const DETAILS_STORAGE_KEY = 'steamstats.gameDetails';
const HINTS_STORAGE_KEY = 'steamstats.catalogHints';
const TTL_MS = 1000 * 60 * 60 * 24 * 2; // 2 days
const MAX_DETAILS = 50;
const MAX_HINTS = 500;

export type CatalogHint = {
  fetchedAt: number;
  headerImage?: string;
  genres: { id: string; description: string }[];
  platforms: { windows: boolean; mac: boolean; linux: boolean };
};

type CacheEntry = {
  fetchedAt: number;
  data: SteamGameDetails;
};

type CacheMap = Record<string, CacheEntry>;
type HintMap = Record<string, CatalogHint>;

/**
 * Catalog store for Steam game details (keyed by appId).
 * Not session-scoped — details are shared across users and survive Steam ID changes.
 */
@Injectable({ providedIn: 'root' })
export class GameDetailsStore {
  private readonly api = inject(Api);

  private readonly memory = new Map<string, CacheEntry>();
  private readonly hints = new Map<string, CatalogHint>();
  private loadGeneration = 0;
  private readonly inFlight = new Map<string, Promise<SteamGameDetails | null>>();

  private readonly activeSignal = signal<SteamGameDetails | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly hintsRevisionSignal = signal(0);

  readonly active = this.activeSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly hintsRevision = this.hintsRevisionSignal.asReadonly();

  constructor() {
    this.hydrateFromStorage();
  }

  /**
   * Ensures details for appId are available (memory → localStorage → API).
   * Race-guarded so rapid route changes cannot apply a stale payload.
   */
  public ensureGameDetails(appId: number | string): void {
    const key = String(appId);
    const gen = ++this.loadGeneration;

    this.errorSignal.set(null);

    const cached = this.getFresh(key);
    if (cached) {
      this.writeHintFromDetails(key, cached);
      if (gen === this.loadGeneration) {
        this.activeSignal.set(cached);
        this.loadingSignal.set(false);
      }
      return;
    }

    this.loadingSignal.set(true);
    this.activeSignal.set(null);

    void this.loadDetails(key).then((details) => {
      if (gen !== this.loadGeneration) {
        return;
      }

      if (details) {
        this.activeSignal.set(details);
        this.errorSignal.set(null);
      } else {
        this.errorSignal.set('Could not load game details');
      }
      this.loadingSignal.set(false);
    });
  }

  /** Compact Store hints without changing the active game-details page. */
  public peekHint(appId: number | string): CatalogHint | null {
    const key = String(appId);
    const hint = this.hints.get(key);
    if (hint && this.isFreshHint(hint)) {
      return hint;
    }
    return null;
  }

  public hasHint(appId: number | string): boolean {
    return this.peekHint(appId) !== null;
  }

  /** Fetch Store details for stats/art fill. Does not steal `active`. */
  public enqueue(appId: number | string): Promise<SteamGameDetails | null> {
    const key = String(appId);
    if (this.peekHint(key)) {
      return Promise.resolve(this.getFresh(key));
    }

    const cached = this.getFresh(key);
    if (cached) {
      this.writeHintFromDetails(key, cached);
      return Promise.resolve(cached);
    }

    return this.loadDetails(key);
  }

  private loadDetails(key: string): Promise<SteamGameDetails | null> {
    let request = this.inFlight.get(key);
    if (!request) {
      request = this.fetchAndCache(key);
      this.inFlight.set(key, request);
      void request.finally(() => {
        this.inFlight.delete(key);
      });
    }
    return request;
  }

  private async fetchAndCache(key: string): Promise<SteamGameDetails | null> {
    try {
      const data = await this.api.invoke(getGameDetails, { appId: key });
      this.writeCache(key, data);
      this.writeHintFromDetails(key, data);
      return data;
    } catch {
      return null;
    }
  }

  private getFresh(key: string): SteamGameDetails | null {
    const memoryHit = this.memory.get(key);
    if (memoryHit && this.isFresh(memoryHit)) {
      return memoryHit.data;
    }

    const stored = this.readDetailsStorage()[key];
    if (stored && this.isFresh(stored)) {
      this.memory.set(key, stored);
      return stored.data;
    }

    return null;
  }

  private isFresh(entry: CacheEntry): boolean {
    return Date.now() - entry.fetchedAt < TTL_MS;
  }

  private isFreshHint(hint: CatalogHint): boolean {
    return Date.now() - hint.fetchedAt < TTL_MS;
  }

  private writeCache(key: string, data: SteamGameDetails): void {
    const entry: CacheEntry = { fetchedAt: Date.now(), data };
    this.memory.set(key, entry);

    const map = this.readDetailsStorage();
    map[key] = entry;
    this.pruneMap(map, MAX_DETAILS, this.memory);
    this.writeJson(DETAILS_STORAGE_KEY, map);
  }

  private writeHintFromDetails(key: string, data: SteamGameDetails): void {
    const hint: CatalogHint = {
      fetchedAt: Date.now(),
      headerImage: data.headerImage,
      genres: (data.genres ?? []).map((genre) => ({
        id: String(genre.id),
        description: genre.description,
      })),
      platforms: {
        windows: !!data.platforms?.windows,
        mac: !!data.platforms?.mac,
        linux: !!data.platforms?.linux,
      },
    };

    this.hints.set(key, hint);
    const map = this.readHintStorage();
    map[key] = hint;
    this.pruneMap(map, MAX_HINTS, this.hints);
    this.writeJson(HINTS_STORAGE_KEY, map);
    this.hintsRevisionSignal.update((n) => n + 1);
  }

  private pruneMap<T>(
    map: Record<string, T & { fetchedAt: number }>,
    max: number,
    memory: Map<string, unknown>,
  ): void {
    const entries = Object.entries(map).sort((a, b) => b[1].fetchedAt - a[1].fetchedAt);
    if (entries.length <= max) {
      return;
    }

    for (const [key] of entries.slice(max)) {
      delete map[key];
      memory.delete(key);
    }
  }

  private hydrateFromStorage(): void {
    const now = Date.now();
    for (const [key, entry] of Object.entries(this.readDetailsStorage())) {
      if (now - entry.fetchedAt < TTL_MS) {
        this.memory.set(key, entry);
        this.writeHintFromDetails(key, entry.data);
      }
    }

    for (const [key, hint] of Object.entries(this.readHintStorage())) {
      if (now - hint.fetchedAt < TTL_MS && !this.hints.has(key)) {
        this.hints.set(key, hint);
      }
    }
  }

  private readDetailsStorage(): CacheMap {
    return this.readJson<CacheMap>(DETAILS_STORAGE_KEY);
  }

  private readHintStorage(): HintMap {
    return this.readJson<HintMap>(HINTS_STORAGE_KEY);
  }

  private readJson<T extends Record<string, unknown>>(key: string): T {
    if (typeof localStorage === 'undefined') {
      return {} as T;
    }

    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return {} as T;
      }
      const parsed = JSON.parse(raw) as T;
      return parsed && typeof parsed === 'object' ? parsed : ({} as T);
    } catch {
      return {} as T;
    }
  }

  private writeJson(key: string, value: unknown): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private mode — memory cache still works.
    }
  }
}
