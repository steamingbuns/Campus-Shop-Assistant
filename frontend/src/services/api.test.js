import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';

describe('api helper', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('includes Authorization header when token provided', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    });

    await api.get('/product', { token: 'abc123' });

    const [, config] = global.fetch.mock.calls[0];
    expect(config.headers.Authorization).toBe('Bearer abc123');
  });

  it('throws on non-2xx response with message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Not found' }),
    });

    await expect(api.get('/missing')).rejects.toThrow('Not found');
  });
});
