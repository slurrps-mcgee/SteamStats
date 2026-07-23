import type {
    LibraryResponse,
    RecentlyPlayedGame,
    OwnedGame,
    WishlistResponse,
} from '@steamstats/shared';

import { SteamApiClient } from '../steam-api.client';

// import {
//     SteamAppService,
// } from './steam-app.service';

import type CacheService from '../cache.service';
import { SteamNotFoundError } from '../../helpers/error.helper';

import { isSteamId64 } from '../../utils/steam-id.util';


function normalizeGame(game: any): OwnedGame {

    return {
        appId: game.appid,
        name: game.name ?? `App ${game.appid}`,
        playtimeForeverMinutes:
            game.playtime_forever,
        playtimeRecentMinutes:
            game.playtime_2weeks ?? 0,
        iconUrl:
            game.img_icon_url
                ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
                : '',
        headerUrl:
            `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
        lastPlayedAt:
            game.rtime_last_played,
    };
}

export class SteamLibraryService {


    constructor(
        private readonly client: SteamApiClient,
        private readonly cache: CacheService,
        // private readonly apps: SteamAppService,
    ) { }

    /** Fetches the user's entire library, including owned games and library statistics. */
    async getLibrary(
        steamId64: string,
    ): Promise<LibraryResponse> {
        if (!isSteamId64(steamId64)) {
            throw new SteamNotFoundError(
                `"${steamId64}" is not a valid SteamID64`,
            );
        }

        return this.cache.remember(
            `library:${steamId64}`,
            1000 * 60 * 60, // 1 hour
            async () => {

                const result =
                    await this.client.getOwnedGames(steamId64);

                const rawGames =
                    result.response.games ?? [];

                const games =
                    rawGames
                        .map(normalizeGame)
                        .sort(
                            (a, b) =>
                                b.playtimeForeverMinutes -
                                a.playtimeForeverMinutes,
                        );

                const totalPlaytimeMinutes =
                    games.reduce(
                        (sum, game) =>
                            sum + game.playtimeForeverMinutes,
                        0,
                    );

                const recentlyPlayedCount =
                    games.filter(
                        (game) =>
                            game.playtimeRecentMinutes > 0,
                    ).length;

                return {
                    games,
                    stats: {
                        totalGames: games.length,
                        totalPlaytimeMinutes,
                        mostPlayedGame: games[0] ?? null,
                        recentlyPlayedCount,
                    },
                };
            },
        );
    }

    /** Fetches a random game from the user's library. */
    async getRandomGame(
        steamId64: string,
    ): Promise<OwnedGame> {

        const { games } =
            await this.getLibrary(steamId64);

        if (games.length === 0) {
            throw new SteamNotFoundError(
                `${steamId64} has no games in their library`,
            );
        }

        const randomIndex =
            Math.floor(Math.random() * games.length);

        return games[randomIndex];
    }


    /** Fetches games played within the last 2 weeks. */
    async getRecentlyPlayedGames(
        steamId64: string,
    ): Promise<RecentlyPlayedGame[]> {
        if (!isSteamId64(steamId64)) {
            throw new SteamNotFoundError(
                `"${steamId64}" is not a valid SteamID64`,
            );
        }

        return this.cache.remember(
            `recent:${steamId64}`,
            1000 * 60 * 5, // 5 minutes
            async () => {

                const result =
                    await this.client.getRecentlyPlayedGames(
                        steamId64,
                    );

                const rawGames =
                    result.response.games ?? [];

                return rawGames.map((game) => ({
                    ...normalizeGame(game),
                    playtimeRecentMinutes:
                        game.playtime_2weeks ?? 0,
                }));
            },
        );
    }

    /** Fetches the user's wishlist with app metadata resolved. */
    // async getWishlist(
    //     steamId64: string,
    // ): Promise<WishlistResponse> {


    //     return this.cache.remember(
    //         `wishlist:${steamId64}`,
    //         1000 * 60 * 60,
    //         async () => {


    //             const result =
    //                 await this.client.getWishlistGames(
    //                     steamId64
    //                 );


    //             const games =
    //                 await Promise.all(
    //                     (result.response.items ?? [])
    //                         .map(async game => ({

    //                             appId: game.appid,

    //                             name:
    //                                 await this.apps.getAppName(
    //                                     game.appid
    //                                 ),

    //                             priority:
    //                                 game.priority ?? 0,

    //                             date_added:
    //                                 game.date_added ?? 0,

    //                         }))
    //                 );


    //             return {
    //                 games:
    //                     games.sort(
    //                         (a, b) =>
    //                             b.priority - a.priority
    //                     ),
    //             };


    //         });


    // }

}