export interface SteamGameDetailsResponse {
  [appId: string]: {
    success: boolean;
    data?: SteamStoreGameData;
  };
}


export interface SteamStoreGameData {
  type: string;
  name: string;
  steam_appid: number;
  required_age: string;
  is_free: boolean;
  controller_support?: string;
  dlc?: number[];
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  header_image: string;
  capsule_image: string;
  capsule_imagev5: string;
  website?: string;
  developers: string[];
  publishers: string[];
  price_overview?: SteamPriceOverview;
  platforms: SteamPlatforms;
  requirements?: SteamRequirements;
  metacritic?: SteamMetacritic;
  categories: SteamCategory[];
  genres: SteamGenre[];
  screenshots: SteamScreenshot[];
  release_date: SteamReleaseDate;
  achievements?: SteamGameAchievements;
  background?: string;
}

export interface SteamRequirements {
  minimum?: string;
  recommended?: string;
}

export interface SteamPriceOverview {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted: string;
  final_formatted: string;
}

export interface SteamPlatforms {
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface SteamMetacritic {
  score: number;
  url: string;
}

export interface SteamCategory {
  id: number;
  description: string;
}

export interface SteamGenre {
  id: string;
  description: string;
}

export interface SteamScreenshot {
  id: number;
  path_thumbnail: string;
  path_full: string;
}

export interface SteamReleaseDate {
  coming_soon: boolean;
  date: string;
}

export interface SteamGameAchievements {
  total: number;
  highlighted: SteamAchievement[];
}

export interface SteamAchievement {
  icon: string;
  localizedName: string;
  archived: number;
  hidden: number;
  path: string;
}