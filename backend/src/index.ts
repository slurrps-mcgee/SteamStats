import { loadConfig } from './config/env';
import { buildApp } from './app';

async function main(): Promise<void> {
  const config = loadConfig();
  const app = buildApp(config);

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
