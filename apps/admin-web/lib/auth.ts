export interface AuthOrganization {
  id: string;
  code: string;
  name: string;
  logoUrl?: string | null;
  currency?: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  preferredLanguage: "AR" | "FR" | "EN";
  isActive: boolean;
  organization: AuthOrganization | null;
}

const TOKEN_KEY = "trexbyte.admin.token";
const USER_KEY = "trexbyte.admin.user";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function hasAuthSession(): boolean {
  return Boolean(getToken());
}
