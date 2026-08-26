export type Fetcher = typeof fetch;

export interface ApiClient {
  baseUrl: string;
  fetcher: Fetcher;
}

export class ApiClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly traceId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function createApiClient(baseUrl: string, fetcher: Fetcher = fetch): ApiClient {
  return { baseUrl: baseUrl.replace(/\/$/, ''), fetcher };
}
