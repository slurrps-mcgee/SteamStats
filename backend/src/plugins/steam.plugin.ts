import fp from 'fastify-plugin';

import { ApiClient } from '../services/api/api.client';
import { SteamAppService } from '../services/api/steam/steam-app.service';
import { SteamLibraryService } from '../services/api/steam/steam-library.service';
import { SteamGameService } from '../services/api/steam/steam-game.service';
import { SteamUserService } from '../services/api/steam/steam-user.service';

declare module 'fastify' {
  interface FastifyInstance {
    steam: {
      user: SteamUserService;
      apps: SteamAppService;
      library: SteamLibraryService;
      games: SteamGameService;
    };
  }
}

export default fp(async (fastify) => {
  const apiClient = new ApiClient(fastify.config.steamApiKey);

  const apps = new SteamAppService(apiClient, fastify.cache);
  const user = new SteamUserService(apiClient, fastify.cache);
  const library = new SteamLibraryService(apiClient, fastify.cache);
  const games = new SteamGameService(apiClient, fastify.cache);

  fastify.decorate('steam', {
    user,
    apps,
    library,
    games,
  });
});
