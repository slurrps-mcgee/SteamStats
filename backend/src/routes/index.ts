import type { FastifyPluginAsync } from 'fastify';
import profileRoute from './profile.route';
import libraryRoute from './library.route';
import gameRoute from './game.route';

/** Registers all `/api/v1` routes. */
const v1Routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(profileRoute);
  await fastify.register(libraryRoute);
  await fastify.register(gameRoute);
};

export default v1Routes;
