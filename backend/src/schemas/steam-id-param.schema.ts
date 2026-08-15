import { Type } from 'typebox';

export const SteamIdParamsSchema = Type.Object(
  {
    steamId: Type.String({ pattern: '^7656119\\d{10}$' }),
  },
  { additionalProperties: false },
);

export type SteamIdParams = Type.Static<typeof SteamIdParamsSchema>;
