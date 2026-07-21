import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';

/** Enables CORS, restricted to the configured frontend origin only. */
const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: fastify.config.frontendOrigin,
    methods: ['GET', 'POST'],
  });
};

export default fp(corsPlugin, { name: 'cors', dependencies: ['config'] });
