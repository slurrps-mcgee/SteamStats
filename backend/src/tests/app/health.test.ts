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
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers['content-security-policy']).toContain("frame-ancestors 'none'");

    await app.close();
  });
});
