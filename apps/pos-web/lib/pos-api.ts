import { getPosToken } from "./auth";

const POS_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function posApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getPosToken();
  const headers = new Headers(init?.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${POS_API_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    let message = `POS API failed: ${response.status}`;
    try {
      const json = (await response.json()) as { message?: string };
      if (json.message) {
        message = json.message;
      }
    } catch {
      // ignore JSON parse failures
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
