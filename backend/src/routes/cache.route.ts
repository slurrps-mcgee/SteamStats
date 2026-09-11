import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { requireAdmin } from '../hooks/require-admin';
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
      preHandler: requireAdmin,
      schema: {
        tags: ['cache'],
        operationId: 'clearCache',
        description: 'Requires the X-Admin-Key header matching ADMIN_API_KEY.',
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
