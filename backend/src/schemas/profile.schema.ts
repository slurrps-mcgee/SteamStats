import { Type } from 'typebox';

export const SteamPersonaStateSchema = Type.Union([
  Type.Literal(0),
  Type.Literal(1),
  Type.Literal(2),
  Type.Literal(3),
  Type.Literal(4),
  Type.Literal(5),
  Type.Literal(6),
]);

export type SteamPersonaState = Type.Static<typeof SteamPersonaStateSchema>;

export const SteamProfileSchema = Type.Object(
  {
    steamId: Type.String(),
    personaName: Type.String(),
    profileUrl: Type.String(),
    avatar: Type.String(),
    avatarMedium: Type.String(),
    avatarFull: Type.String(),
    personaState: SteamPersonaStateSchema,
    visibility: Type.Union([Type.Literal('public'), Type.Literal('private')]),
    lastLogoffAt: Type.Optional(Type.Number()),
    createdAt: Type.Optional(Type.Number()),
    countryCode: Type.Optional(Type.String()),
  },
  { $id: 'SteamProfile', additionalProperties: false },
);

export type SteamProfile = Type.Static<typeof SteamProfileSchema>;

export const ResolveBodySchema = Type.Object(
  {
    input: Type.String({ minLength: 2, maxLength: 256 }),
  },
  { $id: 'ResolveSteamIdRequest', additionalProperties: false },
);

export type ResolveBody = Type.Static<typeof ResolveBodySchema>;

export const ResolveSteamIdResponseSchema = Type.Object(
  {
    steamId: Type.String(),
  },
  { $id: 'ResolveSteamIdResponse', additionalProperties: false },
);

export type ResolveSteamIdResponse = Type.Static<typeof ResolveSteamIdResponseSchema>;
