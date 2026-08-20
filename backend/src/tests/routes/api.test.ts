import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app';
import { SteamNotFoundError } from '../../types/error.types';
import { testConfig } from '../helpers/test-config';

const VALID_STEAM_ID64 = '76561198000000000';

const sampleOwnedGame = {
  appId: 570,
  name: 'Dota 2',
  playtimeForeverMinutes: 100,
  playtimeRecentMinutes: 10,
  iconUrl: 'https://example.com/icon.jpg',
  headerUrl: 'https://example.com/header.jpg',
};

const sampleProfile = {
  steamId: VALID_STEAM_ID64,
  personaName: 'Player',
  profileUrl: 'https://steamcommunity.com/profiles/' + VALID_STEAM_ID64,
  avatar: 'a',
  avatarMedium: 'm',
  avatarFull: 'f',
  personaState: 1 as const,
  visibility: 'public' as const,
};

const sampleGameDetails = {
  appId: 570,
  name: 'Dota 2',
  isFree: true,
  requiredAge: 0,
  headerImage: 'header.jpg',
  capsuleImage: 'capsule.jpg',
  shortDescription: 'About',
  description: 'Detailed',
  developers: ['Valve'],
  publishers: ['Valve'],
  releaseDate: { comingSoon: false, date: '2013' },
  platforms: { windows: true, mac: true, linux: true },
  genres: [],
  categories: [],
  screenshots: [],
};

describe('API routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp(testConfig);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it('GET /api/v1/profile/:steamId returns a profile', async () => {
    vi.spyOn(app.steam.user, 'getProfile').mockResolvedValue(sampleProfile);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/profile/${VALID_STEAM_ID64}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ steamId: VALID_STEAM_ID64, personaName: 'Player' });
  });

  it('GET /api/v1/profile/:steamId maps SteamNotFoundError to 404', async () => {
    vi.spyOn(app.steam.user, 'getProfile').mockRejectedValue(new SteamNotFoundError('gone'));

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/profile/${VALID_STEAM_ID64}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      message: 'gone',
    });
  });

  it('GET /api/v1/profile/:steamId returns 400 for invalid params', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/profile/not-a-steam-id',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ statusCode: 400, error: 'Bad Request' });
  });

  it('POST /api/v1/profile/resolve returns a steamId', async () => {
    vi.spyOn(app.steam.user, 'resolveSteamId').mockResolvedValue(VALID_STEAM_ID64);

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/profile/resolve',
      payload: { input: 'gabe' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ steamId: VALID_STEAM_ID64 });
  });

  it('GET /api/v1/library/:steamId returns library data', async () => {
    vi.spyOn(app.steam.library, 'getLibrary').mockResolvedValue({
      games: [sampleOwnedGame],
      stats: {
        totalGames: 1,
        totalPlaytimeMinutes: 100,
        mostPlayedGame: sampleOwnedGame,
        recentlyPlayedCount: 1,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/library/${VALID_STEAM_ID64}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().stats.totalGames).toBe(1);
  });

  it('GET /api/v1/library/:steamId/random returns a game', async () => {
    vi.spyOn(app.steam.library, 'getRandomGame').mockResolvedValue(sampleOwnedGame);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/library/${VALID_STEAM_ID64}/random`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ appId: 570, name: 'Dota 2' });
  });

  it('GET /api/v1/library/:steamId/recent returns recent games', async () => {
    vi.spyOn(app.steam.library, 'getRecentlyPlayedGames').mockResolvedValue([sampleOwnedGame]);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/library/${VALID_STEAM_ID64}/recent`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(1);
  });

  it('GET /api/v1/library/refresh refreshes apps', async () => {
    vi.spyOn(app.steam.apps, 'refreshApps').mockResolvedValue([]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/library/refresh',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'SteamApps list refreshed successfully',
      status: 200,
    });
  });

  it('GET /api/v1/games/:appId returns game details', async () => {
    vi.spyOn(app.steam.games, 'getGameDetails').mockResolvedValue(sampleGameDetails);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/games/570',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ appId: 570, name: 'Dota 2' });
  });

  it('GET /api/v1/cache/clear clears the cache', async () => {
    vi.spyOn(app.cache, 'clear').mockResolvedValue(undefined);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/cache/clear',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'Cache cleared successfully',
      status: 200,
    });
  });
});
