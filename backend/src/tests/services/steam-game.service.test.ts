import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../services/api/api.client';
import { SteamGameService } from '../../services/api/steam/steam-game.service';
import CacheService from '../../services/cache.service';
import { SteamStoreApiError } from '../../types/error.types';
import type { SteamStoreGameData } from '../../types/steam-store.types';

function buildStoreGame(overrides: Partial<SteamStoreGameData> = {}): SteamStoreGameData {
  return {
    type: 'game',
    name: 'Test Game',
    steam_appid: 570,
    required_age: '0',
    is_free: false,
    detailed_description: 'Detailed',
    about_the_game: 'About',
    short_description: 'Short',
    header_image: 'header.jpg',
    capsule_image: 'capsule.jpg',
    capsule_imagev5: 'capsulev5.jpg',
    developers: ['Dev'],
    publishers: ['Pub'],
    platforms: { windows: true, mac: false, linux: true },
    categories: [{ id: 1, description: 'Single-player' }],
    genres: [{ id: '1', description: 'Action' }],
    screenshots: [{ id: 1, path_thumbnail: 'thumb', path_full: 'full' }],
    release_date: { coming_soon: false, date: '2013' },
    ...overrides,
  };
}

describe('SteamGameService', () => {
  let client: { request: ReturnType<typeof vi.fn> };
  let cache: CacheService;
  let service: SteamGameService;

  beforeEach(() => {
    client = { request: vi.fn() };
    cache = new CacheService();
    service = new SteamGameService(client as unknown as ApiClient, cache);
  });

  it('maps store appdetails into SteamGameDetails', async () => {
    client.request.mockResolvedValue({
      570: {
        success: true,
        data: buildStoreGame({
          controller_support: 'full',
          website: 'https://example.com',
          requirements: { minimum: 'min', recommended: 'rec' },
          metacritic: { score: 90, url: 'https://mc' },
          price_overview: {
            currency: 'USD',
            initial: 1000,
            final: 500,
            discount_percent: 50,
            initial_formatted: '$10.00',
            final_formatted: '$5.00',
          },
          achievements: {
            total: 2,
            highlighted: [
              {
                icon: 'i',
                localizedName: 'First',
                archived: 0,
                hidden: 0,
                path: 'p',
              },
            ],
          },
        }),
      },
    });

    await expect(service.getGameDetails(570)).resolves.toMatchObject({
      appId: 570,
      name: 'Test Game',
      controllerSupport: 'full',
      shortDescription: 'About',
      description: 'Detailed',
      website: 'https://example.com',
      requirements: { minimum: 'min', recommended: 'rec' },
      metacritic: { score: 90, url: 'https://mc' },
      price: {
        currency: 'USD',
        discountPercent: 50,
        finalFormatted: '$5.00',
      },
      platforms: { windows: true, mac: false, linux: true },
      achievements: { total: 2 },
      screenshots: [{ id: 1, thumbnail: 'thumb', full: 'full' }],
    });
  });

  it('throws when the store response has no data for the app', async () => {
    client.request.mockResolvedValue({
      570: { success: false },
    });

    await expect(service.getGameDetails(570)).rejects.toBeInstanceOf(SteamStoreApiError);
  });
});
