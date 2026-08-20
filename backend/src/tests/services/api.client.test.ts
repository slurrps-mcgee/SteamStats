import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../services/api/api.client';
import { SteamApiError, SteamStoreApiError } from '../../types/error.types';
import { mockFetchJson } from '../helpers/mock-fetch';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('adds Steam Web API key and format query params', async () => {
    const fetchMock = mockFetchJson({ body: { ok: true } });
    const client = new ApiClient('my-key');

    await client.request({
      host: 'web',
      path: 'ISteamUser/GetPlayerSummaries/v2/',
      params: { steamids: '1' },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0];
    const parsed = new URL(String(url));
    expect(parsed.origin).toBe('https://api.steampowered.com');
    expect(parsed.pathname).toBe('/ISteamUser/GetPlayerSummaries/v2/');
    expect(parsed.searchParams.get('key')).toBe('my-key');
    expect(parsed.searchParams.get('format')).toBe('json');
    expect(parsed.searchParams.get('steamids')).toBe('1');
  });

  it('throws SteamApiError for non-OK web responses', async () => {
    mockFetchJson({ status: 500, ok: false });
    const client = new ApiClient('my-key');

    await expect(
      client.request({ host: 'web', path: '/ISteamUser/GetPlayerSummaries/v2/' }),
    ).rejects.toBeInstanceOf(SteamApiError);
  });

  it('throws SteamStoreApiError for non-OK store responses', async () => {
    mockFetchJson({ status: 429, ok: false });
    const client = new ApiClient('my-key');

    const request = client.request({
      host: 'store',
      path: '/api/appdetails',
      params: { appids: 1 },
    });
    const assertion = expect(request).rejects.toBeInstanceOf(SteamStoreApiError);
    await vi.runAllTimersAsync();
    await assertion;
  });

  it('spaces store requests by at least 1500ms', async () => {
    const fetchMock = mockFetchJson({ body: { ok: true } });
    const client = new ApiClient('my-key');

    const first = client.request({ host: 'store', path: '/api/appdetails', params: { appids: 1 } });
    await vi.advanceTimersByTimeAsync(0);
    await first;

    const second = client.request({
      host: 'store',
      path: '/api/appdetails',
      params: { appids: 2 },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1499);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await second;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends JSON body for non-GET requests', async () => {
    const fetchMock = mockFetchJson({ body: { ok: true } });
    const client = new ApiClient('my-key');

    await client.request({
      host: 'web',
      path: '/example',
      method: 'POST',
      body: { hello: 'world' },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ hello: 'world' }));
  });
});
