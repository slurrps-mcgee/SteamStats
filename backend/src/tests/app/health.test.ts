import { describe, expect, it } from 'vitest';
import { buildApp } from '../../app';
import { testConfig } from '../helpers/test-config';

describe('GET /health', () => {
  it('returns ok', async () => {
    const app = buildApp(testConfig);
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });

    await app.close();
  });
});
