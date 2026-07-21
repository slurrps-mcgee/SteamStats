import type { AppConfig } from '../config/env';

/**
 * Module augmentation so `fastify.config` is strongly typed wherever the
 * Fastify instance is used.
 */
declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}
