import { timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

export const ADMIN_API_KEY_HEADER = 'x-admin-key';

function keysMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/** Rejects unauthenticated admin routes. Production fails closed when no key is configured. */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const expected = request.server.config.adminApiKey;

  if (!expected) {
    if (request.server.config.nodeEnv === 'production') {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Not Found',
      });
    }
    return;
  }

  const provided = request.headers[ADMIN_API_KEY_HEADER];
  if (typeof provided !== 'string' || !keysMatch(provided, expected)) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid admin key',
    });
  }
}
