import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../services/api/api.client';
import { SteamUserService } from '../../services/api/steam/steam-user.service';
import CacheService from '../../services/cache.service';
import { SteamNotFoundError } from '../../types/error.types';

const VALID_STEAM_ID64 = '76561198000000000';

describe('SteamUserService', () => {
  let client: { request: ReturnType<typeof vi.fn> };
  let cache: CacheService;
  let service: SteamUserService;

  beforeEach(() => {
    client = { request: vi.fn() };
    cache = new CacheService();
    service = new SteamUserService(client as unknown as ApiClient, cache);
  });

  it('resolveSteamId returns SteamID64 without calling the API', async () => {
    await expect(service.resolveSteamId(VALID_STEAM_ID64)).resolves.toBe(VALID_STEAM_ID64);
    expect(client.request).not.toHaveBeenCalled();
  });

  it('resolveSteamId resolves vanity names via the API', async () => {
    client.request.mockResolvedValue({
      response: { success: 1, steamid: VALID_STEAM_ID64 },
    });

    await expect(service.resolveSteamId('gabe')).resolves.toBe(VALID_STEAM_ID64);
    expect(client.request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/ISteamUser/ResolveVanityURL/v1/',
        params: { vanityurl: 'gabe' },
      }),
    );
  });

  it('resolveSteamId throws when vanity resolution fails', async () => {
    client.request.mockResolvedValue({
      response: { success: 42 },
    });

    await expect(service.resolveSteamId('missing')).rejects.toBeInstanceOf(SteamNotFoundError);
  });

  it('getProfile maps player summaries', async () => {
    client.request.mockResolvedValue({
      response: {
        players: [
          {
            steamid: VALID_STEAM_ID64,
            personaname: 'Player',
            profileurl: 'https://example.com',
            avatar: 'a',
            avatarmedium: 'm',
            avatarfull: 'f',
            personastate: 1,
            communityvisibilitystate: 3,
            lastlogoff: 1,
            timecreated: 2,
            loccountrycode: 'US',
          },
        ],
      },
    });

    await expect(service.getProfile(VALID_STEAM_ID64)).resolves.toMatchObject({
      steamId: VALID_STEAM_ID64,
      personaName: 'Player',
      personaState: 1,
      visibility: 'public',
      countryCode: 'US',
    });
  });

  it('getProfile treats unknown persona states as offline and private visibility', async () => {
    client.request.mockResolvedValue({
      response: {
        players: [
          {
            steamid: VALID_STEAM_ID64,
            personaname: 'Player',
            profileurl: 'https://example.com',
            avatar: 'a',
            avatarmedium: 'm',
            avatarfull: 'f',
            personastate: 99,
            communityvisibilitystate: 1,
          },
        ],
      },
    });

    await expect(service.getProfile(VALID_STEAM_ID64)).resolves.toMatchObject({
      personaState: 0,
      visibility: 'private',
    });
  });

  it('getProfile rejects invalid Steam IDs', async () => {
    await expect(service.getProfile('bad')).rejects.toBeInstanceOf(SteamNotFoundError);
  });

  it('getProfile throws when no player is returned', async () => {
    client.request.mockResolvedValue({ response: { players: [] } });
    await expect(service.getProfile(VALID_STEAM_ID64)).rejects.toBeInstanceOf(SteamNotFoundError);
  });
});
