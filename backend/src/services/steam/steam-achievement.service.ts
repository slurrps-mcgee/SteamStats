import CacheService from "../cache.service";
import { SteamApiClient } from '../steam-api.client';

export class SteamAchievementService {
    constructor(
        private readonly client: SteamApiClient,
        private readonly cache: CacheService,
    ) { }
}