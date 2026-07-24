import type { FastifyPluginAsync } from 'fastify';
import type { SteamGameDetails } from '@steamstats/shared';
import {
  gameParamsSchema,
  type GameParams,
} from '../schemas/game.schema';

/**
 * Game detail routes.
 *
 * Handles Steam Store game metadata:
 * - details
 * - pricing
 * - screenshots
 * - achievements summary
 * - genres/categories
 */
const gameRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/games/:appId
   *
   * Returns Steam Store details for a single app.
   */
  fastify.get<{ Params: GameParams }>(
    '/games/:appId',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        params: gameParamsSchema,
      },
    },

    async (
      request,
    ): Promise<SteamGameDetails> => {


      const appId =
        Number(request.params.appId);


      if (Number.isNaN(appId)) {
        throw new Error(
          'Invalid Steam app ID',
        );
      }


      return fastify.steam.games.getGameDetails(
        appId,
      );

    },
  );

};


export default gameRoute;