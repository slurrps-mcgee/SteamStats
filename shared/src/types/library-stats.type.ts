import type { OwnedGame } from './owned-game.type';

/** Aggregate statistics computed over a player's game library. */
export interface LibraryStats {
  /** Total number of games owned. */
  totalGames: number;
  /** Total playtime across the entire library, in minutes. */
  totalPlaytimeMinutes: number;
  /** The game with the highest total playtime, if the library isn't empty. */
  mostPlayedGame: OwnedGame | null;
  /** Number of games played within the last 2 weeks. */
  recentlyPlayedCount: number;
}

/** Response payload for `GET /api/v1/library/:steamId`. */
export interface LibraryResponse {
  games: OwnedGame[];
  stats: LibraryStats;
}
