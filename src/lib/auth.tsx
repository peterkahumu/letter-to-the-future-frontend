"use client";

/**
 * Session state, shared across the app.
 *
 * The provider's job is to answer three questions without flicker: is
 * someone signed in, who are they, and have we finished finding out. That
 * third one matters most — a guard that redirects while the answer is still
 * "loading" bounces signed-in users to the login page on every refresh.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, ApiRequestError, type User } from "@/lib/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  onSessionChange,
  saveSession,
} from "@/lib/tokens";

interface AuthState {
  user: User | null;
  /** True until the first identity check settles. Guards must wait for it. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  /** Adopt a session handed over by a flow that already has one (verify, reset). */
  adoptSession: (tokens: { access: string; refresh: string }, user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch only — it sets no state, so the effect below can decide what to
  // do with the answer once it arrives rather than mid-render.
  const fetchUser = useCallback(async (): Promise<User | null> => {
    if (!getAccessToken() && !getRefreshToken()) return null;
    return api.getMe();
  }, []);

  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchUser()
      .then((loaded) => {
        if (!cancelled) setUser(loaded);
      })
      .catch((error) => {
        if (cancelled) return;
        // 401 after the client has already tried to refresh means the
        // session is genuinely finished. Anything else is a network
        // problem, and signing someone out because their wifi dropped is
        // worse than letting the next request fail.
        if (error instanceof ApiRequestError && error.status === 401) {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchUser, reloadCount]);

  // Signing in or out in one tab settles the others too.
  useEffect(
    () => onSessionChange(() => setReloadCount((count) => count + 1)),
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const body = await api.login(email, password);
    saveSession({
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
    });
    setUser(body.user);
    setLoading(false);
    return body.user;
  }, []);

  const adoptSession = useCallback(
    (tokens: { access: string; refresh: string }, nextUser: User) => {
      saveSession({ accessToken: tokens.access, refreshToken: tokens.refresh });
      setUser(nextUser);
      setLoading(false);
    },
    []
  );

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    // Clear locally first. If the network call fails the user is still
    // signed out here, which is the outcome they asked for; the server-side
    // token then expires on its own.
    clearSession();
    setUser(null);
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch {
        // Best effort.
      }
    }
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await api.getMe());
    } catch {
      // Leave the current value alone; the next guarded request decides.
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, adoptSession, refreshUser }),
    [user, loading, signIn, signOut, adoptSession, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
