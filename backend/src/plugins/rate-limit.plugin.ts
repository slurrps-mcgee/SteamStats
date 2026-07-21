import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyPluginAsync } from 'fastify';

/** Applies a global rate limit to protect the Steam Web API key/quota. */
const rateLimitPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(rateLimit, {
    max: fastify.config.rateLimit.max,
    timeWindow: fastify.config.rateLimit.timeWindowMs,
  });
};

export default fp(rateLimitPlugin, { name: 'rate-limit', dependencies: ['config'] });
