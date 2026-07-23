import CacheService from "../cache.service";
import { SteamApiClient } from '../steam-api.client';
export class SteamGameService {
    // Service for handling Steam game-related operations like game details and statistics and achievements via appid
    constructor(
        private readonly client: SteamApiClient,
        private readonly cache: CacheService,
    ) { }
}