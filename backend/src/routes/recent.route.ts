import type { FastifyPluginAsync } from 'fastify';
import type { RecentlyPlayedGame } from '@steamstats/shared';
import { steamIdParamSchema, type SteamIdParams } from '../schemas/steam-id-param.schema';

/** `GET /api/v1/recent/:steamId` - returns games played in the last 2 weeks. */
const recentRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: SteamIdParams }>(
    '/recent/:steamId',
    { schema: { params: steamIdParamSchema } },
    async (request): Promise<RecentlyPlayedGame[]> => {
      return fastify.steamService.getRecentlyPlayedGames(request.params.steamId);
    },
  );
};

export default recentRoute;
