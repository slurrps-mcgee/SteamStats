import type { FastifyPluginAsync } from 'fastify';

import type {
  LibraryResponse,
  // WishlistResponse,
  RandomGameResponse,
  RecentlyPlayedGame
} from '@steamstats/shared';

import {
  steamIdParamSchema,
  type SteamIdParams,
} from '../schemas/steam-id-param.schema';


/**
 * Library-related routes.
 *
 * Handles:
 * - Owned games
 * - Wishlist
 * - Future library statistics
 */
const libraryRoute: FastifyPluginAsync = async (fastify) => {


  /**
   * GET /api/v1/library/:steamId
   *
   * Returns owned games and library statistics.
   */
  fastify.get<{ Params: SteamIdParams }>(
    '/library/:steamId',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },

      schema: {
        params: steamIdParamSchema,
      },
    },

    async (
      request,
    ): Promise<LibraryResponse> => {

      return fastify.steam.library.getLibrary(
        request.params.steamId,
      );

    },
  );


  /**
 * GET /api/v1/library/:steamId/random
 *
 * Returns a random game from the user's library.
 */
  fastify.get<{ Params: SteamIdParams }>(
    '/library/:steamId/random',
    {
      schema: {
        params: steamIdParamSchema,
      },
    },

    async (
      request,
    ): Promise<RandomGameResponse> => {

      return fastify.steam.library.getRandomGame(
        request.params.steamId,
      );

    },
  );

  /**
 * GET /api/v1/library/:steamId/recent
 *
 * Returns games played within the last 2 weeks.
 */
  fastify.get<{ Params: SteamIdParams }>(
    '/library/:steamId/recent',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },

      schema: {
        params: steamIdParamSchema,
      },
    },

    async (
      request,
    ): Promise<RecentlyPlayedGame[]> => {

      return fastify.steam.library.getRecentlyPlayedGames(
        request.params.steamId,
      );

    },
  );

  /**
   * GET /api/v1/library/:steamId/wishlist
   *
   * Returns wishlist games with app metadata resolved.
   */
  // fastify.get<{ Params: SteamIdParams }>(
  //   '/library/:steamId/wishlist',
  //   {
  //     config: {
  //       rateLimit: {
  //         max: 10,
  //         timeWindow: '1 minute',
  //       },
  //     },

  //     schema: {
  //       params: steamIdParamSchema,
  //     },
  //   },

  //   async (
  //     request,
  //   ): Promise<WishlistResponse> => {

  //     return fastify.steam.library.getWishlist(
  //       request.params.steamId,
  //     );

  //   },
  // );

};


export default libraryRoute;