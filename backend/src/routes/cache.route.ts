import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { StatusMessageSchema } from '../schemas/common.schema';

const cacheRoute: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/cache/clear',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['cache'],
        operationId: 'clearCache',
        response: {
          200: StatusMessageSchema,
        },
      },
    },
    async () => {
      await fastify.cache.clear();
      return { message: 'Cache cleared successfully', status: 200 };
    },
  );
};

export default cacheRoute;
