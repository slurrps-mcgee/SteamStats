import type {
  LibraryResponse,
  OwnedGame,
  RecentlyPlayedGame,
  SteamPersonaState,
  SteamProfile,
} from '@steamstats/shared';
import { SteamApiClient, SteamApiError } from './steam-api.client';
import { isSteamId64, parseSteamInput } from '../utils/steam-id.util';
import type { SteamOwnedGame } from '../types/steam-api.types';
import type CacheService from './cache.service';

/** Thrown when a SteamID64/profile cannot be resolved or found. */
export class SteamNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SteamNotFoundError';
  }
}

function normalizeGame(game: SteamOwnedGame): OwnedGame {
  return {
    appId: game.appid,
    name: game.name ?? `App ${game.appid}`,
    playtimeForeverMinutes: game.playtime_forever,
    playtimeRecentMinutes: game.playtime_2weeks ?? 0,
    iconUrl: game.img_icon_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
      : '',
    headerUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    lastPlayedAt: game.rtime_last_played,
  };
}

/**
 * High-level Steam domain service.
 *
 * Handles:
 * - Steam API communication
 * - Data normalization
 * - Cache management
 */
export class SteamService {
  private readonly client: SteamApiClient;
  private readonly cache: CacheService;
  
  constructor(
    apiKey: string,
    cache: CacheService,
  ) {
    this.client = new SteamApiClient(apiKey);
    this.cache = cache;
  }

  /** Resolves any supported user input into a canonical SteamID64. */
  async resolveSteamId(rawInput: string): Promise<string> {
    return this.cache.remember(
      `resolve:${rawInput}`,
      1000 * 60 * 60 * 24, // 24 hours
      async () => {
        const parsed = parseSteamInput(rawInput);

        if (parsed.kind === 'steamId64') {
          return parsed.value;
        }

        const result = await this.client.resolveVanityUrl(parsed.value);

        if (
          result.response.success !== 1 ||
          !result.response.steamid
        ) {
          throw new SteamNotFoundError(
            `Could not resolve Steam profile for "${rawInput}"`,
          );
        }

        return result.response.steamid;
      },
    );
  }


  /** Fetches a normalized player profile summary. */
  async getPlayerSummary(
    steamId64: string,
  ): Promise<SteamProfile> {

    if (!isSteamId64(steamId64)) {
      throw new SteamNotFoundError(
        `"${steamId64}" is not a valid SteamID64`,
      );
    }

    return this.cache.remember(
      `profile:${steamId64}`,
      1000 * 60 * 15, // 15 minutes
      async () => {

        const result =
          await this.client.getPlayerSummaries(steamId64);

        const player =
          result.response.players[0];

        if (!player) {
          throw new SteamNotFoundError(
            `No Steam profile found for ${steamId64}`,
          );
        }

        return {
          steamId: player.steamid,
          personaName: player.personaname,
          profileUrl: player.profileurl,
          avatar: player.avatar,
          avatarMedium: player.avatarmedium,
          avatarFull: player.avatarfull,
          personaState:
            player.personastate as SteamPersonaState,
          visibility:
            player.communityvisibilitystate === 3
              ? 'public'
              : 'private',
          lastLogoffAt: player.lastlogoff,
          createdAt: player.timecreated,
          countryCode: player.loccountrycode,
        };
      },
    );
  }


  /** Fetches owned games and library stats. */
  async getOwnedGames(
    steamId64: string,
  ): Promise<LibraryResponse> {

    if (!isSteamId64(steamId64)) {
      throw new SteamNotFoundError(
        `"${steamId64}" is not a valid SteamID64`,
      );
    }

    return this.cache.remember(
      `library:${steamId64}`,
      1000 * 60 * 60, // 1 hour
      async () => {

        const result =
          await this.client.getOwnedGames(steamId64);

        const rawGames =
          result.response.games ?? [];

        const games =
          rawGames
            .map(normalizeGame)
            .sort(
              (a, b) =>
                b.playtimeForeverMinutes -
                a.playtimeForeverMinutes,
            );

        const totalPlaytimeMinutes =
          games.reduce(
            (sum, game) =>
              sum + game.playtimeForeverMinutes,
            0,
          );

        const recentlyPlayedCount =
          games.filter(
            (game) =>
              game.playtimeRecentMinutes > 0,
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
      },
    );
  }


  /** Fetches games played within the last 2 weeks. */
  async getRecentlyPlayedGames(
    steamId64: string,
  ): Promise<RecentlyPlayedGame[]> {

    if (!isSteamId64(steamId64)) {
      throw new SteamNotFoundError(
        `"${steamId64}" is not a valid SteamID64`,
      );
    }

    return this.cache.remember(
      `recent:${steamId64}`,
      1000 * 60 * 5, // 5 minutes
      async () => {

        const result =
          await this.client.getRecentlyPlayedGames(
            steamId64,
          );

        const rawGames =
          result.response.games ?? [];

        return rawGames.map((game) => ({
          ...normalizeGame(game),
          playtimeRecentMinutes:
            game.playtime_2weeks ?? 0,
        }));
      },
    );
  }


  /** Picks a random game from cached library data. */
  async getRandomGame(
    steamId64: string,
  ): Promise<OwnedGame> {

    const { games } =
      await this.getOwnedGames(steamId64);

    if (games.length === 0) {
      throw new SteamNotFoundError(
        `${steamId64} has no games in their library`,
      );
    }

    const randomIndex =
      Math.floor(Math.random() * games.length);

    return games[randomIndex];
  }
}

export { SteamApiError };