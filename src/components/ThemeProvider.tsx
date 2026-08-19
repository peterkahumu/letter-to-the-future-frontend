"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "lttf-theme";

/**
 * Runs before first paint to stamp data-theme on <html>, so a dark-mode
 * visitor never sees a flash of the light palette.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}")||"system";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;document.documentElement.setAttribute("data-theme",r);}catch(e){}})();`;

// The preference lives in localStorage and on <html data-theme>; React reads
// it as an external store so the pre-paint script stays the source of truth.
const listeners = new Set<() => void>();

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readTheme(): Theme {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
  } catch {
    return "system";
  }
}

function readResolvedTheme(): ResolvedTheme {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? systemTheme() : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

function notify() {
  for (const listener of listeners) listener();
}

function handleExternalChange() {
  applyTheme(readTheme());
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", handleExternalChange);
  window.addEventListener("storage", handleExternalChange);

  return () => {
    listeners.delete(listener);
    mq.removeEventListener("change", handleExternalChange);
    window.removeEventListener("storage", handleExternalChange);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "system" as Theme
  );
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    readResolvedTheme,
    () => "light" as ResolvedTheme
  );

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing: fall back to an in-session change only.
    }
    applyTheme(next);
    notify();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
