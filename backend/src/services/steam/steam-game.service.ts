import type { SteamGameDetails } from '@steamstats/shared';
import type { SteamStoreGameData } from '../../types/steam-store.types';

import type CacheService from '../cache.service';
import { SteamStoreClient } from '../steam-store.client';
import { SteamStoreApiError } from '../../types/error.types';


export class SteamGameService {
    constructor(
        private readonly steamStoreClient: SteamStoreClient,
        private readonly cache: CacheService,
    ) { }

    async getGameDetails(
        appId: number,
    ): Promise<SteamGameDetails> {
        //TODO: This is for testing only
        this.cache.delete(`library:${appId}`);

        return this.cache.remember(
            `library:${appId}`,
            1000 * 60 * 60 * 24, // 1 day
            async () => {
                const response =
                    await this.steamStoreClient.getAppDetails(appId);

                const app = response[appId]?.data;

                if (!app) {
                    throw new SteamStoreApiError(
                        `Steam game ${appId} not found`,
                        404,
                    );
                }

                return this.mapGameDetails(app);
            },
        );
    }


    private mapGameDetails(
        game: SteamStoreGameData,
    ): SteamGameDetails {

        return {
            appId: game.steam_appid,
            name: game.name,
            isFree: game.is_free,
            requiredAge: game.required_age,
            controllerSupport: game.controller_support ?? undefined,
            headerImage: game.header_image,
            capsuleImage: game.capsule_image,
            shortDescription: game.about_the_game,
            description: game.detailed_description,
            developers: game.developers ?? [],
            publishers: game.publishers ?? [],
            requirements: game.requirements
                ? {
                    minimum: game.requirements.minimum,
                    recommended: game.requirements.recommended,
                }
                : undefined,

            releaseDate: {
                comingSoon: game.release_date.coming_soon,
                date: game.release_date.date,
            },

            metacritic: game.metacritic
                ? {
                    score: game.metacritic.score,
                    url: game.metacritic.url,
                }
                : undefined,

            price: game.price_overview
                ? {
                    currency: game.price_overview.currency,
                    initial: game.price_overview.initial,
                    final: game.price_overview.final,
                    discountPercent:
                        game.price_overview.discount_percent,
                    initialFormatted:
                        game.price_overview.initial_formatted,
                    finalFormatted:
                        game.price_overview.final_formatted,
                }
                : undefined,

            platforms: {
                windows: game.platforms.windows,
                mac: game.platforms.mac,
                linux: game.platforms.linux,
            },

            genres: game.genres ?? [],

            categories:
                game.categories?.map((category) => ({
                    id: category.id,
                    description: category.description,
                })) ?? [],

            screenshots:
                game.screenshots?.map((screenshot) => ({
                    id: screenshot.id,
                    thumbnail: screenshot.path_thumbnail,
                    full: screenshot.path_full,
                })) ?? [],

            achievements: game.achievements
                ? {
                    total: game.achievements.total,
                    highlighted: game.achievements.highlighted,
                }
                : undefined,

            website: game.website,
        };
    }
}