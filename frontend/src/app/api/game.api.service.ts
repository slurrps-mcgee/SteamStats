import type { SteamGameDetails } from '@steamstats/shared';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from './api.service';

/** Typed client for `/games` routes. */
@Injectable({ providedIn: 'root' })
export class GameApiService {
  private readonly api = inject(ApiService);

  /** Fetches Steam Store details for a single app. */
  getGameDetails(appId: number | string): Observable<SteamGameDetails> {
    return this.api.request<SteamGameDetails>({
      path: `/games/${appId}`,
      method: 'GET',
    });
  }
}
