import type { ResolveSteamIdResponse, SteamProfile } from '@steamstats/shared';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from './api.service';

/** Typed client for `/profile` routes. */
@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly api = inject(ApiService);

  /** Resolves a SteamID64, profile URL, or vanity name into a SteamID64. */
  resolveSteamId(input: string): Observable<ResolveSteamIdResponse> {
    return this.api.request<ResolveSteamIdResponse>({
      path: '/profile/resolve',
      method: 'POST',
      body: { input },
    });
  }

  /** Fetches the normalized player profile summary. */
  getProfile(steamId: string): Observable<SteamProfile> {
    return this.api.request<SteamProfile>({
      path: `/profile/${steamId}`,
      method: 'GET',
    });
  }
}
