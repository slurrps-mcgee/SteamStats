import type { AppConfig } from '../../config/env';

export const testConfig: AppConfig = {
  nodeEnv: 'test',
  host: '127.0.0.1',
  port: 0,
  steamApiKey: 'test-steam-api-key',
  frontendOrigin: 'http://localhost:4200',
  rateLimit: {
    max: 1000,
    timeWindowMs: 60_000,
  },
};
