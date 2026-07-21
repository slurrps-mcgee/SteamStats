import Fastify, { type FastifyInstance, type FastifyError } from 'fastify';
import sensible from '@fastify/sensible';
import type { AppConfig } from './config/env';
import { configPlugin } from './plugins/config.plugin';
import corsPlugin from './plugins/cors.plugin';
import rateLimitPlugin from './plugins/rate-limit.plugin';
import steamServicePlugin from './plugins/steam-service.plugin';
import v1Routes from './routes';
import { SteamApiError } from './services/steam-api.client';
import { SteamNotFoundError } from './services/steam.service';

/** Builds (but does not start) a fully configured Fastify instance. */
export function buildApp(config: AppConfig): FastifyInstance {
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
    },
  });

  fastify.register(configPlugin(config));
  fastify.register(sensible);
  fastify.register(corsPlugin);
  fastify.register(rateLimitPlugin);
  fastify.register(steamServicePlugin);
  fastify.register(v1Routes, { prefix: '/api/v1' });

  fastify.get('/health', async () => ({ status: 'ok' }));

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

  return fastify;
}
