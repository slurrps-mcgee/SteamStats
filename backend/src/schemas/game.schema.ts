export const gameParamsSchema = {
  type: 'object',
  properties: {
    appId: { type: 'string' },
  },
  required: ['appId'],
};

export interface GameParams {
  appId: string;
}