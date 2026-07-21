import type { FastifyPluginAsync } from 'fastify';
import type { RandomGameResponse } from '@steamstats/shared';
import { steamIdParamSchema, type SteamIdParams } from '../schemas/steam-id-param.schema';

/** `GET /api/v1/random/:steamId` - returns a random game from the library. */
const randomRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: SteamIdParams }>(
    '/random/:steamId',
    { schema: { params: steamIdParamSchema } },
    async (request): Promise<RandomGameResponse> => {
      return fastify.steamService.getRandomGame(request.params.steamId);
    },
  );
};

export default randomRoute;
