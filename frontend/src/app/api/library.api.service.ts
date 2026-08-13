import type {
  LibraryResponse,
  RandomGameResponse,
  RecentlyPlayedGame,
} from '@steamstats/shared';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from './api.service';

/** Typed client for `/library` routes. */
@Injectable({ providedIn: 'root' })
export class LibraryApiService {
  private readonly api = inject(ApiService);

  /** Fetches the player's full game library plus aggregate stats. */
  getLibrary(steamId: string): Observable<LibraryResponse> {
    return this.api.request<LibraryResponse>({
      path: `/library/${steamId}`,
      method: 'GET',
    });
  }

  /** Fetches games played within the last 2 weeks. */
  getRecentlyPlayed(steamId: string): Observable<RecentlyPlayedGame[]> {
    return this.api.request<RecentlyPlayedGame[]>({
      path: `/library/${steamId}/recent`,
      method: 'GET',
    });
  }

  /** Fetches a single random game from the player's library. */
  getRandomGame(steamId: string): Observable<RandomGameResponse> {
    return this.api.request<RandomGameResponse>({
      path: `/library/${steamId}/random`,
      method: 'GET',
    });
  }

  /** Refreshes the cached Steam apps list on the backend. */
  refreshApps(): Observable<{ message: string; status: number }> {
    return this.api.request<{ message: string; status: number }>({
      path: '/library/refresh',
      method: 'GET',
    });
  }
}
