"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Lock,
  Mail,
  NotebookPen,
} from "lucide-react";
import { EnvelopeIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import NavMenu from "@/components/NavMenu";
import UserMenu from "@/components/UserMenu";
import JournalInfoModal from "@/components/JournalInfoModal";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const SIGNED_IN_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/letters", label: "My letters", icon: Mail },
  { href: "/dashboard/journals", label: "Journals", icon: NotebookPen },
  { href: "/public", label: "Public board", icon: BookOpen },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [journalModalOpen, setJournalModalOpen] = useState(false);

  const signedIn = !loading && Boolean(user);

  function isActive(item: NavLink): boolean {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
        <nav
          aria-label="Main navigation"
          className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8"
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2.5"
            id="nav-logo"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-accent-on transition-transform duration-200 group-hover:scale-105">
              <EnvelopeIcon className="h-5 w-5" />
            </span>
            <span className="hidden truncate font-display text-base leading-none text-ink sm:inline sm:text-lg">
              Letter to the Future
            </span>
            <span className="sr-only sm:hidden">Letter to the Future</span>
          </Link>

          {/* Unpacked Navigation for Large Screens (md+) */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {signedIn ? (
              SIGNED_IN_LINKS.map((item) => {
                const { href, label, icon: Icon } = item;
                const active = isActive(item);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                      active
                        ? "bg-tint text-accent-text"
                        : "text-ink-soft hover:bg-elevated hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                );
              })
            ) : (
              <>
                <Link
                  href="/public"
                  aria-current={pathname.startsWith("/public") ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    pathname.startsWith("/public")
                      ? "bg-tint text-accent-text"
                      : "text-ink-soft hover:bg-elevated hover:text-ink"
                  }`}
                >
                  <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Public board</span>
                </Link>

                {/* Journal indication for non-logged in users */}
                <button
                  type="button"
                  onClick={() => setJournalModalOpen(true)}
                  className={`group flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    pathname.startsWith("/dashboard/journals")
                      ? "bg-tint text-accent-text"
                      : "text-ink-soft hover:bg-elevated hover:text-ink"
                  }`}
                  aria-label="Journals (Offered for logged-in users)"
                  id="nav-journals-guest"
                >
                  <NotebookPen className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                  <span>Journals</span>
                  <span className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-line-strong bg-tint px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-text group-hover:border-accent">
                    <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                    Members
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Action items on the right */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/compose"
              className="flex h-10 items-center rounded-[var(--radius-sm)] bg-accent px-3.5 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover sm:px-5"
              id="nav-compose-cta"
            >
              <span className="sm:hidden">Write</span>
              <span className="hidden sm:inline">Write a letter</span>
            </Link>

            {/* Desktop Account / Sign In (md+) */}
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile Collapsed Menu (below md) */}
            <div className="md:hidden">
              <NavMenu onOpenJournalInfo={() => setJournalModalOpen(true)} />
            </div>
          </div>
        </nav>
      </header>

      {/* Journal Info Modal for Non-logged-in Users */}
      <JournalInfoModal
        open={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
      />
    </>
  );
}
