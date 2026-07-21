/**
 * Normalized game entry, derived from the Steam Web API
 * `IPlayerService/GetOwnedGames` response.
 */
export interface OwnedGame {
  /** Steam application ID. */
  appId: number;
  /** Display name of the game. */
  name: string;
  /** Total playtime across all platforms, in minutes. */
  playtimeForeverMinutes: number;
  /** Playtime in the last 2 weeks, in minutes, if any. */
  playtimeRecentMinutes: number;
  /** URL to the game's library icon artwork. */
  iconUrl: string;
  /** URL to the game's library header artwork. */
  headerUrl: string;
  /** Unix timestamp the game was last played, if known. */
  lastPlayedAt?: number;
}
