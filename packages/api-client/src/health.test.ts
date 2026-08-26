import { describe, expect, it, vi } from 'vitest';
import { createApiClient, getHealth } from './index';

describe('health client', () => {
  it('returns the typed health response', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', service: 'coucoumeow-api', version: '0.1.0' }),
    });

    const result = await getHealth(createApiClient('http://api.test', fetcher));

    expect(result.status).toBe('ok');
    expect(fetcher).toHaveBeenCalledWith('http://api.test/api/v1/health', {
      headers: { Accept: 'application/json' },
    });
  });
});
