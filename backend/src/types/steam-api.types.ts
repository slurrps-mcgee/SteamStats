/**
 * Raw response shapes returned by the Steam Web API.
 *
 * These are intentionally separate from the normalized
 * @steamstats/shared types.
 *
 * Anything that talks directly to Steam should use these types.
 */

export interface SteamAppList {
  appid: number;
  name: string;
  last_modified: number;
  price_change_number: number;
}

export interface SteamAppListResponse {
  response: {
    apps: SteamAppList[];
  };
}


export interface SteamAppDetailsResponse {
  [appId: string]: {
    success: boolean;
    data?: {
      name: string;
      steam_appid: number;
      header_image?: string;
      developers?: string[];
      publishers?: string[];
      genres?: {
        id: string;
        description: string;
      }[];
    };
  };
}


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

  // Steam returns a number here
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


export interface SteamWishlistGame {
  appid: number;

  priority?: number;

  date_added?: number;
}


export interface SteamWishlistResponse {
  response: {
    game_count?: number;

    items?: SteamWishlistGame[];
  };
}