import type { ResolveSteamIdRequest } from '@steamstats/shared';

/** Fastify JSON schema for `POST /api/v1/resolve`. */
export const resolveBodySchema = {
  type: 'object',
  required: ['input'],
  properties: {
    input: {
      type: 'string',
      minLength: 2,
      maxLength: 256,
    },
  },
} as const;

export type ResolveBody = ResolveSteamIdRequest;
