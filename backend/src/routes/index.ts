import type { FastifyPluginAsync } from 'fastify';
import profileRoute from './profile.route';
import libraryRoute from './library.route';

/** Registers all `/api/v1` routes. */
const v1Routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(profileRoute);
  await fastify.register(libraryRoute);
};

export default v1Routes;
