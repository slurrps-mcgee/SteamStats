import { loadConfig } from './config/env';
import { buildApp } from './app';

// Entry point for the backend application. Loads configuration, builds the Fastify app, and starts the server.
async function main(): Promise<void> {
  // Load environment variables and application configuration.
  const config = loadConfig();
  const app = buildApp(config);

  // Build the Fastify application instance with the loaded configuration.
  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

// Start the backend application.
void main();
