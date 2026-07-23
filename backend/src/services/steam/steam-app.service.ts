import type {
  SteamAppList,
} from '../../types/steam-api.types';

import {
  SteamApiClient,
} from '../steam-api.client';

import type CacheService from '../cache.service';


export class SteamAppService {

  constructor(
    private readonly client: SteamApiClient,
    private readonly cache: CacheService,
  ) {}


  async initialize() {
    await this.getApps();
  }


  async getApps(): Promise<SteamAppList[]> {

    return this.cache.remember(
      'steam:apps',
      undefined,
      async () => {

        const result =
          await this.client.getAppList();

        return result.response.apps;
      },
    );
  }



//   async getAppName(
//     appId: number,
//   ): Promise<string> {

//     const apps =
//       await this.getApps();


//     const cached =
//       apps.find(
//         x => x.appid === appId,
//       );


//     if (cached) {
//       return cached.name;
//     }


//     return this.cache.remember(
//       `steam:app:${appId}`,
//       undefined,
//       async () => {

//         const result =
//           await this.client.getAppDetails(
//             appId,
//           );


//         return (
//           result[appId]?.data?.name
//           ??
//           `App ${appId}`
//         );
//       },
//     );
//   }
}