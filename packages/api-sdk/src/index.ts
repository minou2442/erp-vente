export interface ApiClientConfig {
  baseUrl: string;
  token?: string;
}

export function createApiClient(config: ApiClientConfig) {
  return async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  };
}
