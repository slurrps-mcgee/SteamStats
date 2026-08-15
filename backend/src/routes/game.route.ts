import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { ApiErrorSchema } from '../schemas/common.schema';
import { SteamGameDetailsSchema } from '../schemas/game-details.schema';
import { GameParamsSchema } from '../schemas/game.schema';

const gameRoute: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/games/:appId',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['games'],
        operationId: 'getGameDetails',
        params: GameParamsSchema,
        response: {
          200: SteamGameDetailsSchema,
          404: ApiErrorSchema,
        },
      },
    },
    async (request) => {
      const appId = Number(request.params.appId);

      if (Number.isNaN(appId)) {
        throw new Error('Invalid Steam app ID');
      }

      return fastify.steam.games.getGameDetails(appId);
    },
  );
};

export default gameRoute;
