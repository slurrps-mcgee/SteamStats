import type { FastifyPluginAsync } from 'fastify';
import profileRoute from './profile.route';
import libraryRoute from './library.route';
import gameRoute from './game.route';
import cacheRoute from './cache.route';

/** Registers all `/api/v1` routes. */
const v1Routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(profileRoute);
  await fastify.register(libraryRoute);
  await fastify.register(gameRoute);
  await fastify.register(cacheRoute);
};

export default v1Routes;
