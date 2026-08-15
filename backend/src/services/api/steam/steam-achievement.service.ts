import CacheService from '../../cache.service';
import { ApiClient } from '../api.client';

export class SteamAchievementService {
    constructor(
        private readonly client: ApiClient,
        private readonly cache: CacheService,
    ) { }
}
