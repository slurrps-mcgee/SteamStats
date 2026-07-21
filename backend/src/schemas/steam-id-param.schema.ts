/** Fastify JSON schema for the `steamId` route param, shared by most routes. */
export const steamIdParamSchema = {
  type: 'object',
  required: ['steamId'],
  properties: {
    steamId: {
      type: 'string',
      pattern: '^7656119\\d{10}$',
    },
  },
} as const;

export interface SteamIdParams {
  steamId: string;
}
