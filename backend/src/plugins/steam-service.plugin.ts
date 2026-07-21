import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { SteamService } from '../services/steam.service';

/** Decorates the Fastify instance with a singleton `SteamService`. */
const steamServicePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('steamService', new SteamService(fastify.config.steamApiKey, fastify.cache));
};

export default fp(steamServicePlugin, { name: 'steam-service' });
