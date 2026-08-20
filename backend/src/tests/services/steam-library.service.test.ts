import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../services/api/api.client';
import { SteamLibraryService } from '../../services/api/steam/steam-library.service';
import CacheService from '../../services/cache.service';
import { SteamNotFoundError } from '../../types/error.types';

const VALID_STEAM_ID64 = '76561198000000000';

describe('SteamLibraryService', () => {
  let client: { request: ReturnType<typeof vi.fn> };
  let cache: CacheService;
  let service: SteamLibraryService;

  beforeEach(() => {
    client = { request: vi.fn() };
    cache = new CacheService();
    service = new SteamLibraryService(client as unknown as ApiClient, cache);
  });

  it('getLibrary normalizes, sorts, and computes stats', async () => {
    client.request.mockResolvedValue({
      response: {
        games: [
          {
            appid: 10,
            name: 'Less Played',
            playtime_forever: 10,
            playtime_2weeks: 0,
            img_icon_url: 'iconhash',
            rtime_last_played: 100,
          },
          {
            appid: 20,
            playtime_forever: 100,
            playtime_2weeks: 5,
          },
        ],
      },
    });

    const library = await service.getLibrary(VALID_STEAM_ID64);

    expect(library.games[0]).toMatchObject({
      appId: 20,
      name: 'App 20',
      playtimeForeverMinutes: 100,
      playtimeRecentMinutes: 5,
      iconUrl: '',
      headerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/20/header.jpg',
    });
    expect(library.games[1].iconUrl).toContain('/10/iconhash.jpg');
    expect(library.stats).toEqual({
      totalGames: 2,
      totalPlaytimeMinutes: 110,
      mostPlayedGame: library.games[0],
      recentlyPlayedCount: 1,
    });
  });

  it('getLibrary rejects invalid Steam IDs', async () => {
    await expect(service.getLibrary('bad')).rejects.toBeInstanceOf(SteamNotFoundError);
  });

  it('getRandomGame returns a game from the library', async () => {
    client.request.mockResolvedValue({
      response: {
        games: [{ appid: 1, name: 'Only', playtime_forever: 1 }],
      },
    });

    await expect(service.getRandomGame(VALID_STEAM_ID64)).resolves.toMatchObject({
      appId: 1,
      name: 'Only',
    });
  });

  it('getRandomGame throws when the library is empty', async () => {
    client.request.mockResolvedValue({ response: { games: [] } });
    await expect(service.getRandomGame(VALID_STEAM_ID64)).rejects.toBeInstanceOf(
      SteamNotFoundError,
    );
  });

  it('getRecentlyPlayedGames maps recent playtime', async () => {
    client.request.mockResolvedValue({
      response: {
        games: [{ appid: 7, name: 'Recent', playtime_forever: 20, playtime_2weeks: 3 }],
      },
    });

    await expect(service.getRecentlyPlayedGames(VALID_STEAM_ID64)).resolves.toEqual([
      expect.objectContaining({
        appId: 7,
        name: 'Recent',
        playtimeRecentMinutes: 3,
      }),
    ]);
  });

  it('getRecentlyPlayedGames rejects invalid Steam IDs', async () => {
    await expect(service.getRecentlyPlayedGames('bad')).rejects.toBeInstanceOf(SteamNotFoundError);
  });
});
