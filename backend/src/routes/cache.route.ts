import type { FastifyPluginAsync } from 'fastify';


const cacheRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get(
        '/cache/clear',
        {
            config: {
                rateLimit: {
                    max: 10,
                    timeWindow: '1 minute',
                },
            },
        },
        async (
            request,
        ): Promise<{ message: string; status: number }> => {
            await fastify.cache.clear();
            return { message: "Cache cleared successfully", status: 200 };
        },
    );
};

export default cacheRoute;