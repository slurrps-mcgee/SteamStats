import { Injectable, computed, inject, signal } from '@angular/core';
import type { SteamProfile } from '@steamstats/shared';
import { SteamApiService } from '../api/steam-api.service';
import { NotificationService } from './notification.service';

const STORAGE_KEY = 'steamstats.steamId';

/**
 * Holds the currently active SteamID/profile for the whole app.
 *
 * The dashboard's search bar resolves user input into a SteamID64 and stores
 * it here; every other feature (library, random, statistics) reads from this
 * shared session instead of asking the user to search again.
 */
@Injectable({ providedIn: 'root' })
export class SteamSessionService {
  private readonly api = inject(SteamApiService);
  private readonly notifications = inject(NotificationService);

  private readonly steamIdSignal = signal<string | null>(readStoredSteamId());
  private readonly profileSignal = signal<SteamProfile | null>(null);
  private readonly loadingSignal = signal(false);

  readonly steamId = this.steamIdSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly hasActiveProfile = computed(() => this.steamIdSignal() !== null);

  /** Resolves free-form user input (SteamID64/URL/vanity) and loads their profile. */
  resolveAndLoad(input: string): void {
    this.loadingSignal.set(true);

    this.api.resolveSteamId(input).subscribe({
      next: ({ steamId }) => this.setSteamId(steamId),
      error: () => this.loadingSignal.set(false),
    });
  }

  /** Sets the active SteamID directly (e.g. when restoring from storage). */
  setSteamId(steamId: string): void {
    this.steamIdSignal.set(steamId);
    localStorage.setItem(STORAGE_KEY, steamId);
    this.loadProfile(steamId);
  }

  /** Clears the active session. */
  clear(): void {
    this.steamIdSignal.set(null);
    this.profileSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadProfile(steamId: string): void {
    this.loadingSignal.set(true);
    this.api.getProfile(steamId).subscribe({
      next: (profile) => {
        this.profileSignal.set(profile);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.notifications.error('Could not load that Steam profile.');
        this.loadingSignal.set(false);
      },
    });
  }
}

function readStoredSteamId(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}
