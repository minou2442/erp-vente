export interface PosUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  organization: {
    id: string;
    code: string;
    name: string;
  } | null;
}

const TOKEN_KEY = "trexbyte.pos.token";
const USER_KEY = "trexbyte.pos.user";

export function getPosToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setPosSession(token: string, user: PosUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getPosUser(): PosUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PosUser;
  } catch {
    return null;
  }
}

export function clearPosSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
