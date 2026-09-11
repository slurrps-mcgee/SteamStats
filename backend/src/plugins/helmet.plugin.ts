import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';

export default fp(async (fastify) => {
  await fastify.register(helmet, {
    xFrameOptions: {
      action: 'deny',
    },
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
      },
    },
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  });

  // Swagger UI at /docs needs scripts and styles; keep a tight CSP everywhere else.
  fastify.addHook('onSend', async (request, reply) => {
    if (request.url.startsWith('/docs')) {
      reply.header(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      );
    }
  });
});
