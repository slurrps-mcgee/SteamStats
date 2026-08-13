import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from './api.service';

/** Typed client for `/cache` routes. */
@Injectable({ providedIn: 'root' })
export class CacheApiService {
  private readonly api = inject(ApiService);

  /** Clears the backend response cache. */
  clearCache(): Observable<{ message: string; status: number }> {
    return this.api.request<{ message: string; status: number }>({
      path: '/cache/clear',
      method: 'GET',
    });
  }
}
