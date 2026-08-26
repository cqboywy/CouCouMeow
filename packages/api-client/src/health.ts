import type { components } from './generated/schema';
import { ApiClientError, type ApiClient } from './client';

export type HealthResponse = components['schemas']['HealthResponse'];

export async function getHealth(client: ApiClient): Promise<HealthResponse> {
  const response = await client.fetcher(`${client.baseUrl}/api/v1/health`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new ApiClientError('SERVICE_UNAVAILABLE', '学习服务暂时不可用');
  }
  return response.json() as Promise<HealthResponse>;
}
