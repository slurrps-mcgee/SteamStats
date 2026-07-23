import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';

export default fp(async (fastify) => {
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // API only, no frontend rendering
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  });
});