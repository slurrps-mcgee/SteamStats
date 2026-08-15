import { Injectable, inject, signal } from '@angular/core';
import type { SteamGameDetails } from '../interfaces/api';
import { Api } from '../api/generated/api';
import { getGameDetails } from '../api/generated/functions';

const STORAGE_KEY = 'steamstats.gameDetails';
const TTL_MS = 1000 * 60 * 60 * 24 * 2; // 2 days
const MAX_ENTRIES = 50;

type CacheEntry = {
  fetchedAt: number;
  data: SteamGameDetails;
};

type CacheMap = Record<string, CacheEntry>;

/**
 * Catalog store for Steam game details (keyed by appId).
 * Not session-scoped — details are shared across users and survive Steam ID changes.
 */
@Injectable({ providedIn: 'root' })
export class GameDetailsStore {
  private readonly api = inject(Api);

  private readonly memory = new Map<string, CacheEntry>();
  private loadGeneration = 0;
  private readonly inFlight = new Map<string, Promise<SteamGameDetails | null>>();

  private readonly activeSignal = signal<SteamGameDetails | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly active = this.activeSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

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
      if (gen === this.loadGeneration) {
        this.activeSignal.set(cached);
        this.loadingSignal.set(false);
      }
      return;
    }

    this.loadingSignal.set(true);
    this.activeSignal.set(null);

    let request = this.inFlight.get(key);
    if (!request) {
      request = this.fetchAndCache(key);
      this.inFlight.set(key, request);
    }

    void request.then((details) => {
      this.inFlight.delete(key);
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

  private async fetchAndCache(key: string): Promise<SteamGameDetails | null> {
    try {
      const data = await this.api.invoke(getGameDetails, { appId: key });
      this.writeCache(key, data);
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

    const stored = this.readStorage()[key];
    if (stored && this.isFresh(stored)) {
      this.memory.set(key, stored);
      return stored.data;
    }

    return null;
  }

  private isFresh(entry: CacheEntry): boolean {
    return Date.now() - entry.fetchedAt < TTL_MS;
  }

  private writeCache(key: string, data: SteamGameDetails): void {
    const entry: CacheEntry = { fetchedAt: Date.now(), data };
    this.memory.set(key, entry);

    const map = this.readStorage();
    map[key] = entry;
    this.prune(map);
    this.writeStorage(map);
  }

  private prune(map: CacheMap): void {
    const entries = Object.entries(map).sort((a, b) => b[1].fetchedAt - a[1].fetchedAt);
    if (entries.length <= MAX_ENTRIES) {
      return;
    }

    for (const [key] of entries.slice(MAX_ENTRIES)) {
      delete map[key];
      this.memory.delete(key);
    }
  }

  private hydrateFromStorage(): void {
    const map = this.readStorage();
    const now = Date.now();
    for (const [key, entry] of Object.entries(map)) {
      if (now - entry.fetchedAt < TTL_MS) {
        this.memory.set(key, entry);
      }
    }
  }

  private readStorage(): CacheMap {
    if (typeof localStorage === 'undefined') {
      return {};
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw) as CacheMap;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private writeStorage(map: CacheMap): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Quota exceeded or private mode — memory cache still works.
    }
  }
}
