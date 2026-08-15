import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { ApiErrorSchema, StatusMessageSchema } from '../schemas/common.schema';
import {
  LibraryResponseSchema,
  OwnedGameSchema,
  RecentlyPlayedGamesSchema,
} from '../schemas/library.schema';
import { SteamIdParamsSchema } from '../schemas/steam-id-param.schema';

const libraryRoute: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/library/:steamId',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['library'],
        operationId: 'getLibrary',
        params: SteamIdParamsSchema,
        response: {
          200: LibraryResponseSchema,
          404: ApiErrorSchema,
        },
      },
    },
    async (request) => {
      return fastify.steam.library.getLibrary(request.params.steamId);
    },
  );

  fastify.get(
    '/library/:steamId/random',
    {
      schema: {
        tags: ['library'],
        operationId: 'getRandomGame',
        params: SteamIdParamsSchema,
        response: {
          200: OwnedGameSchema,
          404: ApiErrorSchema,
        },
      },
    },
    async (request) => {
      return fastify.steam.library.getRandomGame(request.params.steamId);
    },
  );

  fastify.get(
    '/library/:steamId/recent',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['library'],
        operationId: 'getRecentlyPlayedGames',
        params: SteamIdParamsSchema,
        response: {
          200: RecentlyPlayedGamesSchema,
          404: ApiErrorSchema,
        },
      },
    },
    async (request) => {
      return fastify.steam.library.getRecentlyPlayedGames(request.params.steamId);
    },
  );

  fastify.get(
    '/library/refresh',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['library'],
        operationId: 'refreshApps',
        response: {
          200: StatusMessageSchema,
        },
      },
    },
    async () => {
      await fastify.steam.apps.refreshApps();
      return { message: 'SteamApps list refreshed successfully', status: 200 };
    },
  );
};

export default libraryRoute;
