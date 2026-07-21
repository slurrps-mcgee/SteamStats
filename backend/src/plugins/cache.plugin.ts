import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import CacheService from '../services/cache.service';

// Fastify plugin to add a cache service to the Fastify instance.
const cachePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    'cache',
    new CacheService()
  );
};

export default fp(cachePlugin, {name: 'cache-service',});