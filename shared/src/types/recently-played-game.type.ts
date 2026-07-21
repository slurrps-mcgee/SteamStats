import type { OwnedGame } from './owned-game.type';

/**
 * A game the player has played within the last 2 weeks, derived from the
 * Steam Web API `IPlayerService/GetRecentlyPlayedGames` response.
 */
export interface RecentlyPlayedGame extends OwnedGame {
  /** Playtime in the last 2 weeks, in minutes. Always present here. */
  playtimeRecentMinutes: number;
}
