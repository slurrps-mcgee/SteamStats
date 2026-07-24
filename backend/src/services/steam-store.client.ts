import type {
    SteamGameDetailsResponse,
} from '../types/steam-store.types';

import { SteamStoreApiError } from '../types/error.types'

const STEAM_STORE_BASE_URL = 'https://store.steampowered.com';


/**
 * Thin, low-level HTTP client for the Steam Store API.
 *
 * This client only communicates with:
 * https://store.steampowered.com/api
 *
 * No caching or normalization belongs here.
 */
export class SteamStoreClient {

    /**
     * Fetches public Steam store information for an app.
     *
     * Endpoint:
     * https://store.steampowered.com/api/appdetails
     */
    async getAppDetails(
        appId: number,
    ): Promise<SteamGameDetailsResponse> {

        return this.get<SteamGameDetailsResponse>(
            '/api/appdetails',
            {
                appids: String(appId),
            },
        );

    }



    /**
     * Performs a GET request against Steam Store API.
     */
    private async get<T>(
        path: string,
        params: Record<string, string>,
    ): Promise<T> {

        const url =
            new URL(
                path,
                STEAM_STORE_BASE_URL,
            );

        for (
            const [key, value]
            of Object.entries(params)
        ) {

            url.searchParams.set(
                key,
                value,
            );

        }

        const response =
            await fetch(
                url,
                {
                    method: 'GET',
                },
            );

        if (!response.ok) {

            throw new SteamStoreApiError(
                `Steam Store request failed with status ${response.status}`,
                response.status,
            );

        }

        return (
            await response.json()
        ) as T;
    }

}
