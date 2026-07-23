import fp from 'fastify-plugin';

import { SteamApiClient } from "../services/steam-api.client"
import { SteamAchievementService } from "../services/steam/steam-achievement.service";
import { SteamAppService } from "../services/steam/steam-app.service";
import { SteamLibraryService } from "../services/steam/steam-library.service";
import { SteamGameService } from "../services/steam/steam-game.service";
import { SteamUserService } from "../services/steam/steam-user.service";


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
  const client =
    new SteamApiClient(
      fastify.config.steamApiKey
    );

  const apps =
    new SteamAppService(
      client,
      fastify.cache
    );

  const user =
    new SteamUserService(
      client,
      fastify.cache
    );

  const library =
    new SteamLibraryService(
      client,
      fastify.cache
    );

  const achievements =
    new SteamAchievementService(
      client,
      fastify.cache
    );

  const games =
    new SteamGameService(
      client,
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