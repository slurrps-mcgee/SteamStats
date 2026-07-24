import Fastify, { type FastifyInstance, type FastifyError } from 'fastify';
import sensible from '@fastify/sensible';
import type { AppConfig } from './config/env';
import { configPlugin } from './plugins/config.plugin';
import corsPlugin from './plugins/cors.plugin';
import rateLimitPlugin from './plugins/rate-limit.plugin';
import steamServicePlugin from './plugins/steam.plugin';
import v1Routes from './routes';
import { SteamApiError } from './types/error.types';
import { SteamNotFoundError } from './types/error.types';
import cachePlugin from './plugins/cache.plugin';
import swaggerPlugin from './plugins/swagger.plugin';
import helmetPlugin from './plugins/helmet.plugin';

/** Builds (but does not start) a fully configured Fastify instance. */
export function buildApp(config: AppConfig): FastifyInstance {
  // Create a new Fastify instance with the provided configuration.
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
    },
  });

  // Register application plugins in the correct order.
  fastify.register(configPlugin(config));
  fastify.register(helmetPlugin);
  fastify.register(sensible);
  fastify.register(corsPlugin);
  fastify.register(rateLimitPlugin);
  fastify.register(cachePlugin);
  fastify.register(swaggerPlugin);
  fastify.register(steamServicePlugin);
  fastify.register(v1Routes, { prefix: '/api/v1' });


  // Health check endpoint to verify that the server is running.
  fastify.get('/health', async () => ({ status: 'ok' }));

  // Set a custom error handler to manage different types of errors consistently.
  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof SteamNotFoundError) {
      reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: error.message,
      });
      return;
    }

    if (error instanceof SteamApiError) {
      reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: 'Bad Gateway',
        message: error.message,
      });
      return;
    }

    if (error.validation) {
      reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message,
      });
      return;
    }

    fastify.log.error(error);
    reply.status(error.statusCode ?? 500).send({
      statusCode: error.statusCode ?? 500,
      error: 'Internal Server Error',
      message: config.nodeEnv === 'production' ? 'Something went wrong' : error.message,
    });
  });
  
  // Return the fully configured Fastify instance.
  return fastify;
}
