import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export default fp(async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'SteamStats API',
        description: 'API for Steam profile statistics, libraries, and wishlist data',
        version: '1.0.0',
      },
      servers: [
        {
          url: '/api/v1',
          description: 'API v1',
        },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
});