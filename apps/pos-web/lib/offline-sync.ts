export interface PendingSale {
  id: string;
  createdAt: string;
  payload: unknown;
}

const STORAGE_KEY = "trexbyte.pos.pending.sales";

export function queuePendingSale(sale: PendingSale): void {
  if (typeof window === "undefined") {
    return;
  }

  const current = getPendingSales();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, sale]));
}

export function getPendingSales(): PendingSale[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as PendingSale[];
  } catch {
    return [];
  }
}

export function clearPendingSales(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
