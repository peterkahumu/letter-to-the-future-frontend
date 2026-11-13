"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

function initials(user: { display_name: string; email: string }): string {
  const source = user.display_name.trim() || user.email;
  return source.slice(0, 1).toUpperCase();
}

/**
 * Account menu for desktop navbar. Shows avatar with dropdown when signed in,
 * or Sign In button when not signed in.
 */
export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Reserve the space while the session is still being checked, so the
  // navbar doesn't visibly reshuffle on every page load.
  if (loading) return <div className="h-10 w-20" aria-hidden="true" />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-10 items-center rounded-[var(--radius-sm)] border border-line-strong px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-line-hover hover:text-ink"
        id="nav-signin"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-elevated text-sm font-medium text-accent-text transition-colors duration-200 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        id="user-menu-button"
      >
        {initials(user)}
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-60 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface shadow-[var(--shadow-lg)]"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">
              {user.display_name.trim() || user.email.split("@")[0]}
            </p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
            {user.role === "admin" && (
              <span className="mt-2 inline-block rounded-[var(--radius-full)] border border-line-strong bg-tint px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-text">
                Admin
              </span>
            )}
          </div>

          <div className="p-1.5">
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-ink"
            >
              <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
              Settings
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-ink"
              >
                <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
                Admin
              </Link>
            )}
          </div>

          <div className="border-t border-line p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-danger"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
