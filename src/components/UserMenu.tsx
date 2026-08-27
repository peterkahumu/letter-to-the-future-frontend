"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, LogOut, NotebookPen, Settings, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

function initials(user: { display_name: string; email: string }): string {
  const source = user.display_name.trim() || user.email;
  return source.slice(0, 1).toUpperCase();
}

/** Account menu in the navbar. Closes on Escape, on outside click, and on
 *  navigation — a menu still open behind the next page reads as a bug. */
export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
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
  if (loading) return <div className="h-9 w-9" aria-hidden="true" />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-9 items-center rounded-[var(--radius-sm)] border border-line px-2.5 text-sm text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink sm:px-3"
      >
        Sign in
      </Link>
    );
  }

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/journals", label: "Journals", icon: NotebookPen },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ...(user.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-elevated text-sm font-medium text-accent-text transition-colors duration-200 hover:border-accent"
      >
        {initials(user)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface shadow-[var(--shadow-lg)]"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm text-ink">{user.display_name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
            {user.role === "admin" && (
              <span className="mt-1.5 inline-block rounded-[var(--radius-full)] bg-tint px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent-text">
                Admin
              </span>
            )}
          </div>

          <nav className="py-1">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-ink"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-line py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-danger"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
