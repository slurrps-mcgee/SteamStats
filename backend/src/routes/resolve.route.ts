import type { FastifyPluginAsync } from 'fastify';
import type { ResolveSteamIdResponse } from '@steamstats/shared';
import { resolveBodySchema, type ResolveBody } from '../schemas/resolve.schema';

/** `POST /api/v1/resolve` - normalizes any supported input into a SteamID64. */
const resolveRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: ResolveBody }>(
    '/resolve',
    { schema: { body: resolveBodySchema } },
    async (request): Promise<ResolveSteamIdResponse> => {
      const steamId = await fastify.steamService.resolveSteamId(request.body.input);
      return { steamId };
    },
  );
};

export default resolveRoute;
