import { Type } from 'typebox';

export const OwnedGameSchema = Type.Object(
  {
    appId: Type.Number(),
    name: Type.String(),
    playtimeForeverMinutes: Type.Number(),
    playtimeRecentMinutes: Type.Number(),
    iconUrl: Type.String(),
    headerUrl: Type.String(),
    lastPlayedAt: Type.Optional(Type.Number()),
  },
  { additionalProperties: false },
);

export type OwnedGame = Type.Static<typeof OwnedGameSchema>;

export const RecentlyPlayedGameSchema = Type.Object(
  {
    appId: Type.Number(),
    name: Type.String(),
    playtimeForeverMinutes: Type.Number(),
    playtimeRecentMinutes: Type.Number(),
    iconUrl: Type.String(),
    headerUrl: Type.String(),
    lastPlayedAt: Type.Optional(Type.Number()),
  },
  { additionalProperties: false },
);

export type RecentlyPlayedGame = Type.Static<typeof RecentlyPlayedGameSchema>;

export const LibraryStatsSchema = Type.Object(
  {
    totalGames: Type.Number(),
    totalPlaytimeMinutes: Type.Number(),
    mostPlayedGame: Type.Union([OwnedGameSchema, Type.Null()]),
    recentlyPlayedCount: Type.Number(),
  },
  { additionalProperties: false },
);

export type LibraryStats = Type.Static<typeof LibraryStatsSchema>;

export const LibraryResponseSchema = Type.Object(
  {
    games: Type.Array(OwnedGameSchema),
    stats: LibraryStatsSchema,
  },
  { $id: 'LibraryResponse', additionalProperties: false },
);

export type LibraryResponse = Type.Static<typeof LibraryResponseSchema>;

export const RecentlyPlayedGamesSchema = Type.Array(RecentlyPlayedGameSchema);
