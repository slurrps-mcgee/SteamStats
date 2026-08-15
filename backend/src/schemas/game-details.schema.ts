import { Type } from 'typebox';

export const SteamGameReleaseDateSchema = Type.Object(
  {
    comingSoon: Type.Boolean(),
    date: Type.String(),
  },
  { additionalProperties: false },
);

export const SteamGamePriceSchema = Type.Object(
  {
    currency: Type.String(),
    initial: Type.Number(),
    final: Type.Number(),
    discountPercent: Type.Number(),
    initialFormatted: Type.String(),
    finalFormatted: Type.String(),
  },
  { additionalProperties: false },
);

export const SteamGamePlatformsSchema = Type.Object(
  {
    windows: Type.Boolean(),
    mac: Type.Boolean(),
    linux: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const SteamGameGenreSchema = Type.Object(
  {
    id: Type.String(),
    description: Type.String(),
  },
  { additionalProperties: false },
);

export const SteamGameCategorySchema = Type.Object(
  {
    id: Type.Number(),
    description: Type.String(),
  },
  { additionalProperties: false },
);

export const SteamGameScreenshotSchema = Type.Object(
  {
    id: Type.Number(),
    thumbnail: Type.String(),
    full: Type.String(),
  },
  { additionalProperties: false },
);

export const SteamAchievementSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    path: Type.Optional(Type.String()),
    icon: Type.Optional(Type.String()),
    localizedName: Type.Optional(Type.String()),
    archived: Type.Optional(Type.Number()),
    hidden: Type.Optional(Type.Number()),
  },
  { additionalProperties: true },
);

export const SteamGameAchievementsSchema = Type.Object(
  {
    total: Type.Number(),
    highlighted: Type.Array(SteamAchievementSchema),
  },
  { additionalProperties: false },
);

export const SteamGameMetacriticSchema = Type.Object(
  {
    score: Type.Number(),
    url: Type.String(),
  },
  { additionalProperties: false },
);

export const SteamGameRequirementsSchema = Type.Object(
  {
    minimum: Type.Optional(Type.String()),
    recommended: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const SteamGameDetailsSchema = Type.Object(
  {
    appId: Type.Number(),
    name: Type.String(),
    isFree: Type.Boolean(),
    requiredAge: Type.Union([Type.String(), Type.Number()]),
    controllerSupport: Type.Optional(Type.String()),
    headerImage: Type.String(),
    capsuleImage: Type.String(),
    shortDescription: Type.String(),
    description: Type.String(),
    developers: Type.Array(Type.String()),
    publishers: Type.Array(Type.String()),
    releaseDate: SteamGameReleaseDateSchema,
    price: Type.Optional(SteamGamePriceSchema),
    platforms: SteamGamePlatformsSchema,
    genres: Type.Array(SteamGameGenreSchema),
    categories: Type.Array(SteamGameCategorySchema),
    screenshots: Type.Array(SteamGameScreenshotSchema),
    achievements: Type.Optional(SteamGameAchievementsSchema),
    metacritic: Type.Optional(SteamGameMetacriticSchema),
    requirements: Type.Optional(SteamGameRequirementsSchema),
    website: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  },
  { $id: 'SteamGameDetails', additionalProperties: false },
);

export type SteamGameDetails = Type.Static<typeof SteamGameDetailsSchema>;
