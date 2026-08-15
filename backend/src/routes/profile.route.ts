import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { ApiErrorSchema } from '../schemas/common.schema';
import {
  ResolveBodySchema,
  ResolveSteamIdResponseSchema,
  SteamProfileSchema,
} from '../schemas/profile.schema';
import { SteamIdParamsSchema } from '../schemas/steam-id-param.schema';

const profileRoute: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/profile/:steamId',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['profile'],
        operationId: 'getProfile',
        params: SteamIdParamsSchema,
        response: {
          200: SteamProfileSchema,
          404: ApiErrorSchema,
        },
      },
    },
    async (request) => {
      return fastify.steam.user.getProfile(request.params.steamId);
    },
  );

  fastify.post(
    '/profile/resolve',
    {
      schema: {
        tags: ['profile'],
        operationId: 'resolveSteamId',
        body: ResolveBodySchema,
        response: {
          200: ResolveSteamIdResponseSchema,
          404: ApiErrorSchema,
        },
      },
    },
    async (request) => {
      const steamId = await fastify.steam.user.resolveSteamId(request.body.input);
      return { steamId };
    },
  );
};

export default profileRoute;
