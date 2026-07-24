import fp from 'fastify-plugin';

import { SteamApiClient } from "../services/steam-api.client"
import { SteamAchievementService } from "../services/steam/steam-achievement.service";
import { SteamAppService } from "../services/steam/steam-app.service";
import { SteamLibraryService } from "../services/steam/steam-library.service";
import { SteamGameService } from "../services/steam/steam-game.service";
import { SteamUserService } from "../services/steam/steam-user.service";
import { SteamStoreClient } from '../services/steam-store.client';


declare module 'fastify' {

  interface FastifyInstance {

    steam: {
      user: SteamUserService;
      apps: SteamAppService;
      library: SteamLibraryService;
      achievements: SteamAchievementService;
      games: SteamGameService;
    }
  }
}

export default fp(async fastify => {
  const apiClient =
    new SteamApiClient(
      fastify.config.steamApiKey
    );
  
  const storeClient =
    new SteamStoreClient();

  const apps =
    new SteamAppService(
      apiClient,
      fastify.cache
    );

  const user =
    new SteamUserService(
      apiClient,
      fastify.cache
    );

  const library =
    new SteamLibraryService(
      apiClient,
      fastify.cache
    );

  const achievements =
    new SteamAchievementService(
      apiClient,
      fastify.cache
    );

  const games =
    new SteamGameService(
      storeClient,
      fastify.cache
    );

  fastify.decorate(
    'steam',
    {
      user,
      apps,
      library,
      achievements,
      games,
    });


  await apps.initialize();
});