import {
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';

import type {
  SteamProfile,
  LibraryResponse,
  RecentlyPlayedGame,
  OwnedGame,
} from '@steamstats/shared';

import { SteamApiService } from '../api/steam-api.service';
import { NotificationService } from './notification.service';


const STORAGE_KEY = 'steamstats.steamId';


@Injectable({ providedIn: 'root' })
export class SteamSessionService {
  constructor() {
    this.restoreSession();
  }

  private readonly api = inject(SteamApiService);
  private readonly notifications = inject(NotificationService);


  // Signals for storing the current state of the Steam session.
  private readonly steamIdSignal =
    signal<string | null>(this.readStoredSteamId());

  private readonly profileSignal =
    signal<SteamProfile | null>(null);

  private readonly librarySignal =
    signal<LibraryResponse | null>(null);

  private readonly recentGamesSignal =
    signal<RecentlyPlayedGame[]>([]);

  private readonly randomGameSignal =
    signal<OwnedGame | null>(null);


  private readonly loadingSignal =
    signal(false);

  // Readonly signals for exposing the current state of the Steam session to other parts of the application.
  readonly steamId =
    this.steamIdSignal.asReadonly();

  readonly profile =
    this.profileSignal.asReadonly();

  readonly library =
    this.librarySignal.asReadonly();

  readonly recentGames =
    this.recentGamesSignal.asReadonly();

  readonly randomGame =
    this.randomGameSignal.asReadonly();


  readonly loading =
    this.loadingSignal.asReadonly();


  readonly hasActiveProfile =
    computed(() =>
      this.steamIdSignal() !== null
    );


  // Public Methods //
  // Public method for resolving a Steam ID and loading the associated profile.
  public resolveAndLoad(input: string): void {

    this.loadingSignal.set(true);

    this.api.resolveSteamId(input)
      .subscribe({

        next: ({ steamId }) =>
          this.setSteamId(steamId),

        error: () =>
          this.loadingSignal.set(false),
      });
  }

  // Public method for loading the dashboard data associated with the current Steam ID.
  public loadDashboardData(): void {

    const steamId =
      this.steamIdSignal();

    if (!steamId) {
      return;
    }


    // already loaded
    if (this.librarySignal()) {
      return;
    }


    this.api.getLibrary(steamId)
      .subscribe({
        next: data =>
          this.librarySignal.set(data)
      });


    this.api.getRecentlyPlayed(steamId)
      .subscribe({
        next: games =>
          this.recentGamesSignal.set(games)
      });


    this.api.getRandomGame(steamId)
      .subscribe({
        next: game =>
          this.randomGameSignal.set(game)
      });
  }

  // Public method for clearing the current Steam session and associated dashboard data.
  public clear(): void {

    this.steamIdSignal.set(null);
    this.profileSignal.set(null);

    this.clearDashboardCache();

    localStorage.removeItem(STORAGE_KEY);
  }

  // Private Methods //
  // Private method for setting the current Steam ID and handling associated state changes.
  private setSteamId(steamId: string): void {

    const changed =
      this.steamIdSignal() !== steamId;


    this.steamIdSignal.set(steamId);

    localStorage.setItem(
      STORAGE_KEY,
      steamId
    );


    // Only clear cache when switching users
    if (changed) {
      this.clearDashboardCache();
    }


    this.loadProfile(steamId);
  }

  // Private method for clearing the cached dashboard data.
  private clearDashboardCache(): void {

    this.librarySignal.set(null);
    this.recentGamesSignal.set([]);
    this.randomGameSignal.set(null);

  }

  // Private method for loading the profile data associated with the given Steam ID.
  private loadProfile(steamId: string): void {

    this.loadingSignal.set(true);


    this.api.getProfile(steamId)
      .subscribe({

        next: profile => {

          this.profileSignal.set(profile);
          this.loadingSignal.set(false);

        },


        error: () => {

          this.notifications.error(
            'Could not load that Steam profile.'
          );

          this.loadingSignal.set(false);
        }

      });
  }

  // Private method for restoring the Steam session from the stored Steam ID.
  private restoreSession(): void {

    const steamId = this.steamIdSignal();

    if (!steamId) {
      return;
    }

    this.loadProfile(steamId);
    this.loadDashboardData();
  }

  // Private method for reading the stored Steam ID from local storage.
  private readStoredSteamId(): string | null {

    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(STORAGE_KEY);

  }
}