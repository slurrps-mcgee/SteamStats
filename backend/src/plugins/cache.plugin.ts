import fp from 'fastify-plugin';
import CacheService from '../services/cache.service';


export default fp(async (fastify) => {

  const cache =
    new CacheService();

  await cache.load();

  fastify.decorate(
    'cache',
    cache,
  );

  fastify.addHook(
    'onClose',
    async () => {
      await cache.save();
    },
  );

});