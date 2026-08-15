import type { Observable } from 'rxjs';
import type { StrictHttpResponse } from '../api/generated/strict-http-response';
import {
  clearCache,
  getGameDetails,
  getLibrary,
  getProfile,
  getRandomGame,
  getRecentlyPlayedGames,
  resolveSteamId,
} from '../api/generated/functions';

type ResponseBody<Fn> = Fn extends (...args: never[]) => Observable<StrictHttpResponse<infer Body>>
  ? Body
  : never;

export type SteamProfile = ResponseBody<typeof getProfile>;
export type SteamPersonaState = SteamProfile['personaState'];
export type ResolveSteamIdResponse = ResponseBody<typeof resolveSteamId>;
export type LibraryResponse = ResponseBody<typeof getLibrary>;
export type OwnedGame = ResponseBody<typeof getRandomGame>;
export type RandomGameResponse = OwnedGame;
export type RecentlyPlayedGame = ResponseBody<typeof getRecentlyPlayedGames>[number];
export type SteamGameDetails = ResponseBody<typeof getGameDetails>;
export type StatusMessage = ResponseBody<typeof clearCache>;
