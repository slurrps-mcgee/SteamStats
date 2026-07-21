import type { FastifyPluginAsync } from 'fastify';
import type { LibraryResponse } from '@steamstats/shared';
import { steamIdParamSchema, type SteamIdParams } from '../schemas/steam-id-param.schema';

/** `GET /api/v1/library/:steamId` - returns owned games plus library stats. */
const libraryRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: SteamIdParams }>(
    '/library/:steamId',
    { schema: { params: steamIdParamSchema } },
    async (request): Promise<LibraryResponse> => {
      return fastify.steamService.getOwnedGames(request.params.steamId);
    },
  );
};

export default libraryRoute;
