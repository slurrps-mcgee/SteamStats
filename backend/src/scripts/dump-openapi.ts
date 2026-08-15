import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildApp } from '../app';
import type { AppConfig } from '../config/env';

const config: AppConfig = {
  nodeEnv: 'development',
  host: '127.0.0.1',
  port: 0,
  steamApiKey: 'openapi-dump',
  frontendOrigin: 'http://localhost:4200',
  rateLimit: {
    max: 30,
    timeWindowMs: 60000,
  },
};

async function dumpOpenApi(): Promise<void> {
  const app = buildApp(config);
  await app.ready();

  const spec = app.swagger();
  const outPath = resolve(__dirname, '../../../frontend/src/app/api/openapi.json');

  await writeFile(outPath, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');
  await app.close();

  console.log(`Wrote OpenAPI spec to ${outPath}`);
}

void dumpOpenApi().catch((error) => {
  console.error(error);
  process.exit(1);
});
