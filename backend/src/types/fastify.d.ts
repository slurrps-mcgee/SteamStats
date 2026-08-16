import type { AppConfig } from '../config/env';
import type CacheService from '../services/cache.service';

/**
 * Fastify instance augmentation for config and cache.
 * Steam services are declared in plugins/steam.plugin.ts.
 */
declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
    cache: CacheService;
  }
}
