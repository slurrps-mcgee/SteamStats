/**
 * Normalized Steam game details, derived from the Steam Store API
 * `store.steampowered.com/api/appdetails` response.
 */
export interface SteamGameDetails {
  /** Steam application ID. */
  appId: number;
  /** Display name of the game. */
  name: string;
  /** Whether this app is free to play. */
  isFree: boolean;
  /** Minimum age requirement. */
  requiredAge: string;
  /** Controller support information, if available. */
  controllerSupport?: string;
  /** Main game header image URL. */
  headerImage: string;
  /** Small capsule image URL. */
  capsuleImage: string;
  /** Short game description. */
  shortDescription: string;
  /** Full game description with HTML formatting. */
  description: string;
  /** Developer names. */
  developers: string[];
  /** Publisher names. */
  publishers: string[];
  /** Release information. */
  releaseDate: SteamGameReleaseDate;
  /** Current pricing information, if available. */
  price?: SteamGamePrice;
  /** Supported platforms. */
  platforms: SteamGamePlatforms;
  /** Steam genres. */
  genres: SteamGameGenre[];
  /** Steam categories/features. */
  categories: SteamGameCategory[];
  /** Screenshot gallery. */
  screenshots: SteamGameScreenshot[];
  /** Highlighted achievements. */
  achievements?: SteamGameAchievements;
  /** Metacritic information. */
  metacritic?: SteamGameMetacritic;
  /** PC requirements. */
  requirements?: SteamGameRequirements;
  /** External game website. */
  website?: string;
}

export interface SteamGameReleaseDate {
  /** Whether the game has not released yet. */
  comingSoon: boolean;
  /** Human-readable release date. */
  date: string;
}

export interface SteamGamePrice {
  currency: string;
  /** Original price in cents. */
  initial: number;
  /** Current price in cents. */
  final: number;
  discountPercent: number;
  initialFormatted: string;
  finalFormatted: string;
}

export interface SteamGamePlatforms {
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface SteamGameGenre {
  id: string;
  description: string;
}

export interface SteamGameCategory {
  id: number;
  description: string;
}

export interface SteamGameScreenshot {
  id: number;
  thumbnail: string;
  full: string;
}

export interface SteamGameAchievements {
  total: number;
  highlighted: SteamAchievement[];
}

export interface SteamAchievement {
  icon: string;
  localizedName: string;
  archived: number;
  hidden: number
  path: string;
}

export interface SteamGameMetacritic {
  score: number;
  url: string;
}

export interface SteamGameRequirements {
  minimum?: string;
  recommended?: string;
}