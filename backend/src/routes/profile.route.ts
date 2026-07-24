import type { FastifyPluginAsync } from 'fastify';

import type {
  SteamProfile,
  ResolveSteamIdResponse,
} from '@steamstats/shared';

import {
  steamIdParamSchema,
  type SteamIdParams,
} from '../schemas/steam-id-param.schema';

import {
  resolveBodySchema,
  type ResolveBody,
} from '../schemas/resolve.schema';


/**
 * User/profile routes.
 *
 * Handles:
 * - Steam profile lookup
 * - Steam ID resolution
 */
const profileRoute: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/profile/:steamId
   *
   * Returns normalized Steam profile data.
   */
  fastify.get<{ Params: SteamIdParams }>(
    '/profile/:steamId',
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
    ): Promise<SteamProfile> => {

      return fastify.steam.user.getProfile(
        request.params.steamId,
      );

    },
  );

  /**
   * POST /api/v1/profile/resolve
   *
   * Resolves:
   * - SteamID64
   * - vanity URLs
   * - supported Steam profile inputs
   */
  fastify.post<{ Body: ResolveBody }>(
    '/profile/resolve',
    {
      schema: {
        body: resolveBodySchema,
      },
    },

    async (
      request,
    ): Promise<ResolveSteamIdResponse> => {

      const steamId =
        await fastify.steam.user.resolveSteamId(
          request.body.input,
        );


      return {
        steamId,
      };

    },
  );

};


export default profileRoute;