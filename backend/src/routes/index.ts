import type { FastifyPluginAsync } from 'fastify';
import resolveRoute from './resolve.route';
import profileRoute from './profile.route';
import libraryRoute from './library.route';
import recentRoute from './recent.route';
import randomRoute from './random.route';

/** Registers all `/api/v1` routes. */
const v1Routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(resolveRoute);
  await fastify.register(profileRoute);
  await fastify.register(libraryRoute);
  await fastify.register(recentRoute);
  await fastify.register(randomRoute);
};

export default v1Routes;
