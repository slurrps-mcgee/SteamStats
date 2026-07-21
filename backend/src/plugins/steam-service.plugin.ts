import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { SteamService } from '../services/steam.service';

declare module 'fastify' {
  interface FastifyInstance {
    steamService: SteamService;
  }
}

/** Decorates the Fastify instance with a singleton `SteamService`. */
const steamServicePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('steamService', new SteamService(fastify.config.steamApiKey));
};

export default fp(steamServicePlugin, { name: 'steam-service' });
