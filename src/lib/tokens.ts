/**
 * Where the session lives in the browser.
 *
 * Tokens are kept in localStorage, which means any script running on this
 * origin can read them — so the app ships no third-party scripts and every
 * letter and entry body is sanitized server-side before it is ever rendered.
 * The access token is deliberately short-lived to bound the damage if one
 * does leak; the refresh token is what survives a reload.
 *
 * Every read is wrapped: localStorage throws outright in some privacy modes,
 * and a storage failure should sign someone out, not white-screen the app.
 */

const ACCESS_KEY = "lttf.access";
const REFRESH_KEY = "lttf.refresh";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode with storage disabled: the session lasts this page only.
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return read(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return read(REFRESH_KEY);
}

export function saveSession({ accessToken, refreshToken }: StoredSession): void {
  if (typeof window === "undefined") return;
  write(ACCESS_KEY, accessToken);
  write(REFRESH_KEY, refreshToken);
  // Tell the other tabs. `storage` only fires in *other* tabs, which is
  // exactly the audience that needs to know.
  window.dispatchEvent(new Event("lttf:session"));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Nothing to clear.
  }
  window.dispatchEvent(new Event("lttf:session"));
}

/** Fires when this tab or another one signs in or out. */
export function onSessionChange(handler: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === ACCESS_KEY || e.key === REFRESH_KEY) handler();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("lttf:session", handler);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("lttf:session", handler);
  };
}
