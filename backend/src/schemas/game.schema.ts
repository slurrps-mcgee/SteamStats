import { Type } from 'typebox';

export const GameParamsSchema = Type.Object(
  {
    appId: Type.String(),
  },
  { additionalProperties: false },
);

export type GameParams = Type.Static<typeof GameParamsSchema>;
