import { Injectable, computed, inject, signal } from '@angular/core';

import type { SteamProfile, LibraryResponse } from '../interfaces/api';

import { Api } from '../api/generated/api';
import { getLibrary, getProfile, resolveSteamId } from '../api/generated/functions';

const STORAGE_KEY = 'steamstats.steamId';

/**
 * Session store for the active Steam user.
 * Owns steamId, profile, and shared library cache across routes.
 * Game catalog details belong in GameDetailsStore, not here.
 */
@Injectable({ providedIn: 'root' })
export class SteamSessionStore {
  constructor() {
    this.restoreSession();
  }

  private readonly api = inject(Api);

  private readonly steamIdSignal = signal<string | null>(this.readStoredSteamId());
  private readonly profileSignal = signal<SteamProfile | null>(null);
  private readonly librarySignal = signal<LibraryResponse | null>(null);
  private readonly profileLoadingSignal = signal(false);
  private readonly libraryLoadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  private resolveGeneration = 0;
  private profileGeneration = 0;
  private libraryGeneration = 0;

  /** In-flight library fetch shared across callers of ensureLibrary(). */
  private libraryInFlight: Promise<void> | null = null;

  readonly steamId = this.steamIdSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly library = this.librarySignal.asReadonly();
  readonly profileLoading = this.profileLoadingSignal.asReadonly();
  readonly libraryLoading = this.libraryLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly loading = computed(() => this.profileLoadingSignal() || this.libraryLoadingSignal());

  readonly hasActiveProfile = computed(() => this.steamIdSignal() !== null);

  /** Resolves a Steam ID and loads the associated profile + library. */
  public resolveAndLoad(input: string): void {
    const gen = ++this.resolveGeneration;
    this.errorSignal.set(null);
    this.profileLoadingSignal.set(true);

    void (async () => {
      try {
        const data = await this.api.invoke(resolveSteamId, { body: { input } });
        if (gen !== this.resolveGeneration) {
          return;
        }
        this.setSteamId(data.steamId);
      } catch {
        if (gen !== this.resolveGeneration) {
          return;
        }
        this.profileLoadingSignal.set(false);
        this.errorSignal.set('Could not resolve Steam ID');
      }
    })();
  }

  /**
   * Ensures library data is loaded for the current Steam ID.
   * Dedupes concurrent callers and skips work when already cached.
   */
  public ensureLibrary(): void {
    const steamId = this.steamIdSignal();
    if (!steamId) {
      return;
    }

    if (this.librarySignal()) {
      return;
    }

    if (this.libraryInFlight) {
      return;
    }

    const gen = ++this.libraryGeneration;
    this.libraryLoadingSignal.set(true);

    this.libraryInFlight = (async () => {
      try {
        const data = await this.api.invoke(getLibrary, { steamId });
        if (gen !== this.libraryGeneration) {
          return;
        }
        this.librarySignal.set(data);
        this.errorSignal.set(null);
      } catch {
        if (gen !== this.libraryGeneration) {
          return;
        }
        this.errorSignal.set('Could not load library');
      } finally {
        if (gen === this.libraryGeneration) {
          this.libraryLoadingSignal.set(false);
        }
        this.libraryInFlight = null;
      }
    })();
  }

  /** Clears the current Steam session and associated dashboard data. */
  public clear(): void {
    this.resolveGeneration++;
    this.profileGeneration++;
    this.libraryGeneration++;
    this.libraryInFlight = null;

    this.steamIdSignal.set(null);
    this.profileSignal.set(null);
    this.librarySignal.set(null);
    this.profileLoadingSignal.set(false);
    this.libraryLoadingSignal.set(false);
    this.errorSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private setSteamId(steamId: string): void {
    const changed = this.steamIdSignal() !== steamId;

    this.steamIdSignal.set(steamId);
    localStorage.setItem(STORAGE_KEY, steamId);

    if (changed) {
      this.profileSignal.set(null);
      this.librarySignal.set(null);
      this.libraryGeneration++;
      this.libraryInFlight = null;
    }

    this.loadProfile(steamId);
    this.ensureLibrary();
  }

  private loadProfile(steamId: string): void {
    const gen = ++this.profileGeneration;
    this.profileLoadingSignal.set(true);
    this.errorSignal.set(null);

    void (async () => {
      try {
        const data = await this.api.invoke(getProfile, { steamId });
        if (gen !== this.profileGeneration) {
          return;
        }
        this.profileSignal.set(data);
      } catch {
        if (gen !== this.profileGeneration) {
          return;
        }
        this.errorSignal.set('Could not load profile');
      } finally {
        if (gen === this.profileGeneration) {
          this.profileLoadingSignal.set(false);
        }
      }
    })();
  }

  private restoreSession(): void {
    const steamId = this.steamIdSignal();
    if (!steamId) {
      return;
    }

    this.loadProfile(steamId);
    this.ensureLibrary();
  }

  private readStoredSteamId(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(STORAGE_KEY);
  }
}
