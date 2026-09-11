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

/** Fastify 5.12.4 requires `schema` on type providers; typebox 6.1.0 does not declare it yet. */
declare module '@fastify/type-provider-typebox' {
  interface TypeBoxTypeProvider {
    readonly schema: unknown;
  }
}
