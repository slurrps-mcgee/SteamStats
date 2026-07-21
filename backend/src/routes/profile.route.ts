import type { FastifyPluginAsync } from 'fastify';
import type { SteamProfile } from '@steamstats/shared';
import { steamIdParamSchema, type SteamIdParams } from '../schemas/steam-id-param.schema';

/** `GET /api/v1/profile/:steamId` - returns a normalized player profile. */
const profileRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: SteamIdParams }>(
    '/profile/:steamId',
    { schema: { params: steamIdParamSchema } },
    async (request): Promise<SteamProfile> => {
      return fastify.steamService.getPlayerSummary(request.params.steamId);
    },
  );
};

export default profileRoute;
