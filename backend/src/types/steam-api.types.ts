/**
 * Raw response shapes returned by the Steam Web API. These are intentionally
 * kept separate from the normalized `@steamstats/shared` types - anything
 * that talks to Steam directly should go through `SteamApiClient`, which
 * maps these raw shapes into normalized DTOs.
 */

export interface SteamResolveVanityUrlResponse {
  response: {
    success: number;
    steamid?: string;
    message?: string;
  };
}

export interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
  lastlogoff?: number;
  timecreated?: number;
  loccountrycode?: string;
}

export interface SteamPlayerSummariesResponse {
  response: {
    players: SteamPlayerSummary[];
  };
}

export interface SteamOwnedGame {
  appid: number;
  name?: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  rtime_last_played?: number;
}

export interface SteamOwnedGamesResponse {
  response: {
    game_count?: number;
    games?: SteamOwnedGame[];
  };
}

export interface SteamRecentlyPlayedGamesResponse {
  response: {
    total_count?: number;
    games?: SteamOwnedGame[];
  };
}
