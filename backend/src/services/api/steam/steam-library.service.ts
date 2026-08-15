import type {
  LibraryResponse,
  RecentlyPlayedGame,
  OwnedGame,
} from '../../../schemas/library.schema';

import { ApiClient } from '../api.client';
import type {
  SteamOwnedGame,
  SteamOwnedGamesResponse,
  SteamRecentlyPlayedGamesResponse,
} from '../../../types/steam-api.types';

import type CacheService from '../../cache.service';
import { SteamNotFoundError } from '../../../types/error.types';

import { isSteamId64 } from '../../../utils/steam-id.util';

function normalizeGame(game: SteamOwnedGame): OwnedGame {
  return {
    appId: game.appid,
    name: game.name ?? `App ${game.appid}`,
    playtimeForeverMinutes: game.playtime_forever,
    playtimeRecentMinutes: game.playtime_2weeks ?? 0,
    iconUrl: game.img_icon_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
      : '',
    headerUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`,
    lastPlayedAt: game.rtime_last_played,
  };
}

export class SteamLibraryService {
  constructor(
    private readonly client: ApiClient,
    private readonly cache: CacheService,
  ) {}

  /** Fetches the user's entire library, including owned games and library statistics. */
  async getLibrary(steamId64: string): Promise<LibraryResponse> {
    if (!isSteamId64(steamId64)) {
      throw new SteamNotFoundError(`"${steamId64}" is not a valid SteamID64`);
    }

    return this.cache.remember(`library:v2:${steamId64}`, 1000 * 60 * 60, async () => {
      const result = await this.client.request<SteamOwnedGamesResponse>({
        host: 'web',
        path: '/IPlayerService/GetOwnedGames/v1/',
        params: {
          steamid: steamId64,
          include_appinfo: '1',
          include_played_free_games: '1',
        },
      });

      const games = (result.response.games ?? [])
        .map(normalizeGame)
        .sort((a, b) => b.playtimeForeverMinutes - a.playtimeForeverMinutes);

      const totalPlaytimeMinutes = games.reduce(
        (sum, game) => sum + game.playtimeForeverMinutes,
        0,
      );

      const recentlyPlayedCount = games.filter(
        (game) => game.playtimeRecentMinutes > 0,
      ).length;

      return {
        games,
        stats: {
          totalGames: games.length,
          totalPlaytimeMinutes,
          mostPlayedGame: games[0] ?? null,
          recentlyPlayedCount,
        },
      };
    });
  }

  /** Fetches a random game from the user's library. */
  async getRandomGame(steamId64: string): Promise<OwnedGame> {
    const { games } = await this.getLibrary(steamId64);

    if (games.length === 0) {
      throw new SteamNotFoundError(`${steamId64} has no games in their library`);
    }

    const randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex];
  }

  /** Fetches games played within the last 2 weeks. */
  async getRecentlyPlayedGames(steamId64: string): Promise<RecentlyPlayedGame[]> {
    if (!isSteamId64(steamId64)) {
      throw new SteamNotFoundError(`"${steamId64}" is not a valid SteamID64`);
    }

    return this.cache.remember(`recent:v2:${steamId64}`, 1000 * 60 * 5, async () => {
      const result = await this.client.request<SteamRecentlyPlayedGamesResponse>({
        host: 'web',
        path: '/IPlayerService/GetRecentlyPlayedGames/v1/',
        params: { steamid: steamId64 },
      });

      return (result.response.games ?? []).map((game) => ({
        ...normalizeGame(game),
        playtimeRecentMinutes: game.playtime_2weeks ?? 0,
      }));
    });
  }
}
