import type {
  SteamAppListResponse,
  SteamOwnedGamesResponse,
  SteamPlayerSummariesResponse,
  SteamRecentlyPlayedGamesResponse,
  SteamResolveVanityUrlResponse,
  SteamWishlistResponse,
} from '../types/steam-api.types';

const STEAM_API_BASE_URL = 'https://api.steampowered.com';

/** Thrown when the Steam Web API returns an unexpected or failed response. */
export class SteamApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 502,
  ) {
    super(message);
    this.name = 'SteamApiError';
  }
}

/**
 * Thin, low-level HTTP client for the Steam Web API. Every method here maps
 * 1:1 to a single Steam Web API interface call. This is the only module in
 * the backend that is allowed to talk to `api.steampowered.com` directly.
 */
export class SteamApiClient {
  constructor(private readonly apiKey: string) {}

  async getAppList(): Promise<SteamAppListResponse> {
    return this.get<SteamAppListResponse>('/IStoreService/GetAppList/v1/', {});
  }
  

  async resolveVanityUrl(vanityName: string): Promise<SteamResolveVanityUrlResponse> {
    return this.get<SteamResolveVanityUrlResponse>('/ISteamUser/ResolveVanityURL/v1/', {
      vanityurl: vanityName,
    });
  }

  async getPlayerSummaries(steamId64: string): Promise<SteamPlayerSummariesResponse> {
    return this.get<SteamPlayerSummariesResponse>('/ISteamUser/GetPlayerSummaries/v2/', {
      steamids: steamId64,
    });
  }

  async getOwnedGames(steamId64: string): Promise<SteamOwnedGamesResponse> {
    return this.get<SteamOwnedGamesResponse>('/IPlayerService/GetOwnedGames/v1/', {
      steamid: steamId64,
      include_appinfo: '1',
      include_played_free_games: '1',
    });
  }

  async getRecentlyPlayedGames(steamId64: string): Promise<SteamRecentlyPlayedGamesResponse> {
    return this.get<SteamRecentlyPlayedGamesResponse>(
      '/IPlayerService/GetRecentlyPlayedGames/v1/',
      { steamid: steamId64 },
    );
  }

  async getWishlistGames(steamId64: string): Promise<SteamWishlistResponse> {
    return this.get<SteamWishlistResponse>('/IWishlistService/GetWishlist/v1/', {
      steamid: steamId64,
    });
  }

  /**
   * Performs a GET request to the Steam Web API with the given path and query parameters.
   * @param path The API endpoint path (e.g., '/ISteamUser/GetPlayerSummaries/v2/').
   * @param params A record of query parameters to include in the request.
   * @returns The parsed JSON response from the Steam Web API.
   * @throws {SteamApiError} If the request fails or the response is not OK.
   */
  private async get<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(path, STEAM_API_BASE_URL);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('format', 'json');
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new SteamApiError(
        `Steam Web API request failed with status ${response.status}`,
        response.status === 403 ? 502 : 502,
      );
    }

    return (await response.json()) as T;
  }
}
