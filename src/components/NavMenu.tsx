"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  NotebookPen,
  PenLine,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Mobile navigation menu for small screens (< md).
 * On large screens, navigation is unpacked directly into the navbar.
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  isMemberOnly?: boolean;
}

const SIGNED_IN: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/letters", label: "My letters", icon: Mail },
  { href: "/dashboard/journals", label: "Journals", icon: NotebookPen },
  { href: "/compose", label: "Write a letter", icon: PenLine },
  { href: "/public", label: "Public board", icon: BookOpen },
];

const GUEST_ITEMS: NavItem[] = [
  { href: "/compose", label: "Write a letter", icon: PenLine },
  { href: "/public", label: "Public board", icon: BookOpen },
  {
    href: "/dashboard/journals",
    label: "Journals",
    icon: NotebookPen,
    isMemberOnly: true,
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

interface NavMenuProps {
  onOpenJournalInfo?: () => void;
}

export default function NavMenu({ onOpenJournalInfo }: NavMenuProps) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [openedAt, setOpenedAt] = useState(pathname);
  if (open && openedAt !== pathname) setOpen(false);

  const openMenu = () => {
    setOpenedAt(pathname);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    const gap = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    const firstLink = panelRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  const signedIn = !loading && Boolean(user);
  const items = signedIn ? SIGNED_IN : GUEST_ITEMS;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-line-strong px-3 text-sm text-ink-soft transition-colors duration-200 hover:border-line-hover hover:text-ink"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Menu</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-[var(--scrim)]"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          <div
            ref={panelRef}
            id={panelId}
            className="absolute inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-surface shadow-[var(--shadow-lg)] sm:inset-x-auto sm:right-8 sm:top-[calc(100%+0.5rem)] sm:w-80 sm:rounded-[var(--radius-md)] sm:border"
          >
            {signedIn && user && (
              <div className="border-b border-line px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-elevated text-sm font-medium text-accent-text"
                    aria-hidden="true"
                  >
                    {(user.display_name.trim() || user.email)
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {user.display_name || user.email.split("@")[0]}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {user.email}
                    </p>
                  </div>
                </div>
                {user.role === "admin" && (
                  <span className="mt-2.5 inline-block rounded-[var(--radius-full)] border border-line-strong bg-tint px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent-text">
                    Admin
                  </span>
                )}
              </div>
            )}

            <nav aria-label="Mobile navigation" className="p-2">
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const { href, label, icon: Icon, isMemberOnly } = item;
                  const active = isActive(pathname, item);

                  if (isMemberOnly && !signedIn) {
                    return (
                      <li key={label}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            onOpenJournalInfo?.();
                          }}
                          className="flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-ink"
                          aria-label={`${label} (Offered for logged-in users)`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                            <span>{label}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-line-strong bg-tint px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-text">
                            <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                            Members
                          </span>
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors duration-150 ${
                          active
                            ? "bg-tint text-accent-text font-medium"
                            : "text-ink-soft hover:bg-elevated hover:text-ink"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-line p-2">
              {signedIn && user ? (
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-ink"
                    >
                      <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Settings
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <li>
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-ink"
                      >
                        <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        void signOut();
                      }}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-sm text-ink-soft transition-colors duration-150 hover:bg-elevated hover:text-danger"
                    >
                      <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Sign out
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="flex h-10 items-center justify-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="flex h-10 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong px-4 text-sm font-medium text-ink-soft transition-colors duration-200 hover:border-line-hover hover:text-ink"
                  >
                    Create free account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
