import { SteamApiError, SteamStoreApiError } from '../../types/error.types';

export type SteamHost = 'web' | 'store';

export type ApiRequestOptions = {
  host: SteamHost;
  path: string;
  method?: 'GET' | 'POST';
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
};

const BASE_URL: Record<SteamHost, string> = {
  web: 'https://api.steampowered.com',
  store: 'https://store.steampowered.com',
};

/**
 * Shared HTTP client for Steam Web API and Steam Store.
 * Domain services pass `host` + `path`; this class does not know Steam endpoints.
 */
const STORE_GAP_MS = 1500;

export class ApiClient {
  private storeTail: Promise<void> = Promise.resolve();
  private lastStoreAt = 0;

  constructor(private readonly steamApiKey: string) {}

  async request<T>(opts: ApiRequestOptions): Promise<T> {
    if (opts.host === 'store') {
      return this.enqueueStore(() => this.send<T>(opts));
    }

    return this.send<T>(opts);
  }

  private enqueueStore<T>(send: () => Promise<T>): Promise<T> {
    const run = this.storeTail.then(async () => {
      const wait = STORE_GAP_MS - (Date.now() - this.lastStoreAt);
      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
      this.lastStoreAt = Date.now();
      return send();
    });

    this.storeTail = run.then(
      () => undefined,
      () => undefined,
    );

    return run;
  }

  private async send<T>(opts: ApiRequestOptions): Promise<T> {
    const path = opts.path.startsWith('/') ? opts.path : `/${opts.path}`;
    const url = new URL(path, BASE_URL[opts.host]);

    if (opts.host === 'web') {
      url.searchParams.set('key', this.steamApiKey);
      url.searchParams.set('format', 'json');
    }

    if (opts.params) {
      for (const [key, value] of Object.entries(opts.params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const method = (opts.method ?? 'GET').toUpperCase();
    const headers = new Headers(opts.headers);

    const init: RequestInit = { method, headers };

    if (opts.body !== undefined && method !== 'GET') {
      headers.set('Content-Type', 'application/json');
      init.body = JSON.stringify(opts.body);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      if (opts.host === 'web') {
        throw new SteamApiError(`Steam Web API request failed with status ${response.status}`, 502);
      }

      throw new SteamStoreApiError(
        `Steam Store request failed with status ${response.status}`,
        response.status,
      );
    }

    return (await response.json()) as T;
  }
}
