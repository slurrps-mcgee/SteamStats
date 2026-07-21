import type { AppConfig } from '../config/env';
import type { CacheService } from '../services/cache.service';
import { SteamService } from '../services/steam.service';

/**
 * A module augmentation for the Fastify instance to include strongly typed `config`, `cache`, and `steamService` properties.
 */
declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
    cache: CacheService;
    steamService: SteamService;
  }
}