import { vi } from 'vitest';

type MockFetchOptions = {
  status?: number;
  body?: unknown;
  ok?: boolean;
};

export function mockFetchJson(options: MockFetchOptions = {}) {
  const status = options.status ?? 200;
  const ok = options.ok ?? (status >= 200 && status < 300);

  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => options.body ?? {},
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function mockFetchSequence(
  responses: Array<{ status?: number; body?: unknown; ok?: boolean }>,
) {
  const fetchMock = vi.fn();

  for (const response of responses) {
    const status = response.status ?? 200;
    const ok = response.ok ?? (status >= 200 && status < 300);
    fetchMock.mockResolvedValueOnce({
      ok,
      status,
      json: async () => response.body ?? {},
    });
  }

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
