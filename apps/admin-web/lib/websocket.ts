export function createSocketUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return `${base.replace("http://", "ws://").replace("https://", "wss://")}${path}`;
}

export function createWebSocketConnection(path: string): WebSocket | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new WebSocket(createSocketUrl(path));
}
