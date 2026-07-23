import type { LibraryResponse, OwnedGame, RecentlyPlayedGame, SteamProfile } from '@steamstats/shared';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

/** Base path for all backend API calls. Relative so it works behind any reverse proxy. */
const API_BASE_URL = '/api/v1';

/**
 * Typed HTTP client for the SteamStats backend API. This is the only place
 * in the frontend that knows about backend route shapes - feature code
 * should depend on this service instead of calling `HttpClient` directly.
 */
@Injectable({ providedIn: 'root' })
export class SteamApiService {
  private readonly http = inject(HttpClient);

  /** Resolves a SteamID64, profile URL, or vanity name into a SteamID64. */
  resolveSteamId(input: string): Observable<{ steamId: string }> {
    return this.http.post<{ steamId: string }>(`${API_BASE_URL}/profile/resolve`, { input });
  }

  /** Fetches the normalized player profile summary. */
  getProfile(steamId: string): Observable<SteamProfile> {
    return this.http.get<SteamProfile>(`${API_BASE_URL}/profile/${steamId}`);
  }

  /** Fetches the player's full game library plus aggregate stats. */
  getLibrary(steamId: string): Observable<LibraryResponse> {
    return this.http.get<LibraryResponse>(`${API_BASE_URL}/library/${steamId}`);
  }

  /** Fetches games played within the last 2 weeks. */
  getRecentlyPlayed(steamId: string): Observable<RecentlyPlayedGame[]> {
    return this.http.get<RecentlyPlayedGame[]>(`${API_BASE_URL}/library/${steamId}/recent`);
  }

  /** Fetches a single random game from the player's library. */
  getRandomGame(steamId: string): Observable<OwnedGame> {
    return this.http.get<OwnedGame>(`${API_BASE_URL}/library/${steamId}/random`);
  }
}
