import type {
  SteamProfile,
  SteamPersonaState,
} from '@steamstats/shared';

import {
  SteamApiClient,
} from '../steam-api.client';

import {
  isSteamId64,
  parseSteamInput,
} from '../../utils/steam-id.util';

import type CacheService from '../cache.service';
import { SteamNotFoundError } from '../../helpers/error.helper';


function normalizePersonaState(
  state: number,
): SteamPersonaState {

  switch (state) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      return state;

    default:
      return 0;
  }
}


export class SteamUserService {

  constructor(
    private readonly client: SteamApiClient,
    private readonly cache: CacheService,
  ) {}


  async resolveSteamId(
    rawInput: string,
  ): Promise<string> {

    return this.cache.remember(
      `resolve:${rawInput}`,
      1000 * 60 * 60 * 24,
      async () => {

        const parsed =
          parseSteamInput(rawInput);


        if (parsed.kind === 'steamId64') {
          return parsed.value;
        }


        const result =
          await this.client.resolveVanityUrl(
            parsed.value,
          );


        if (
          result.response.success !== 1 ||
          !result.response.steamid
        ) {
          throw new SteamNotFoundError(
            `Could not resolve ${rawInput}`,
          );
        }


        return result.response.steamid;
      },
    );
  }



  async getProfile(
    steamId64: string,
  ): Promise<SteamProfile> {


    if (!isSteamId64(steamId64)) {
      throw new SteamNotFoundError(
        'Invalid Steam ID',
      );
    }


    return this.cache.remember(
      `profile:${steamId64}`,
      1000 * 60 * 15,
      async () => {

        const result =
          await this.client.getPlayerSummaries(
            steamId64,
          );


        const player =
          result.response.players[0];


        if (!player) {
          throw new SteamNotFoundError(
            'Profile not found',
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
            normalizePersonaState(
              player.personastate,
            ),

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
}