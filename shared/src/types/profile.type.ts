/**
 * Normalized Steam player profile, derived from the Steam Web API
 * `ISteamUser/GetPlayerSummaries` response.
 */
export interface SteamProfile {
  /** The player's 64-bit SteamID. */
  steamId: string;
  /** The player's public display name. */
  personaName: string;
  /** URL to the player's Steam Community profile. */
  profileUrl: string;
  /** URL to the player's 32x32 avatar. */
  avatar: string;
  /** URL to the player's 64x64 avatar. */
  avatarMedium: string;
  /** URL to the player's 184x184 avatar. */
  avatarFull: string;
  /** Online status of the player. See `SteamPersonaState`. */
  personaState: SteamPersonaState;
  /** Whether the profile is publicly visible. */
  visibility: 'public' | 'private';
  /** Unix timestamp of the last time the user logged off, if known. */
  lastLogoffAt?: number;
  /** Unix timestamp of when the account was created, if known. */
  createdAt?: number;
  /** ISO 3166 country code, if known. */
  countryCode?: string;
}

/**
 * Mirrors Steam's `EPersonaState` enum. Modeled as a numeric literal union
 * (instead of a TypeScript `enum`) so this package can remain type-only,
 * with zero runtime code to build or ship.
 */
export type SteamPersonaState = 0 | 1 | 2 | 3 | 4 | 5 | 6;
