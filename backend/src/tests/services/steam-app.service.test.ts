import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../services/api/api.client';
import { SteamAppService } from '../../services/api/steam/steam-app.service';
import CacheService from '../../services/cache.service';

describe('SteamAppService', () => {
  let client: { request: ReturnType<typeof vi.fn> };
  let cache: CacheService;
  let service: SteamAppService;

  beforeEach(() => {
    client = { request: vi.fn() };
    cache = new CacheService();
    service = new SteamAppService(client as unknown as ApiClient, cache);
  });

  it('getApps fetches and caches the app list', async () => {
    const apps = [{ appid: 1, name: 'One', last_modified: 1, price_change_number: 1 }];
    client.request.mockResolvedValue({ response: { apps } });

    await expect(service.getApps()).resolves.toEqual(apps);
    await expect(service.getApps()).resolves.toEqual(apps);
    expect(client.request).toHaveBeenCalledTimes(1);
  });

  it('refreshApps clears the cache and refetches', async () => {
    client.request
      .mockResolvedValueOnce({
        response: {
          apps: [{ appid: 1, name: 'Old', last_modified: 1, price_change_number: 1 }],
        },
      })
      .mockResolvedValueOnce({
        response: {
          apps: [{ appid: 2, name: 'New', last_modified: 2, price_change_number: 2 }],
        },
      });

    await service.getApps();
    const refreshed = await service.refreshApps();

    expect(refreshed).toEqual([
      { appid: 2, name: 'New', last_modified: 2, price_change_number: 2 },
    ]);
    expect(client.request).toHaveBeenCalledTimes(2);
  });
});
