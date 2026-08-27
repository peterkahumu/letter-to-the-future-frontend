"use client";

import Link from "next/link";
import { EnvelopeIcon } from "@/components/icons";
import NavMenu from "@/components/NavMenu";

/**
 * The header is deliberately thin: a wordmark, the one action the site is
 * for, and the menu. Everything else lives inside NavMenu, at every screen
 * size, so there is one navigation to learn and one to maintain.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" id="nav-logo">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-accent-on">
            <EnvelopeIcon className="h-5 w-5" />
          </span>
          {/* The full name needs room; below `sm` the mark carries it. */}
          <span className="hidden truncate font-display text-base leading-none text-ink sm:inline sm:text-lg">
            Letter to the Future
          </span>
          <span className="sr-only sm:hidden">Letter to the Future</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Kept out of the menu on purpose — it is the site's whole point,
              and burying the primary action behind a click costs more than
              the space it takes. */}
          <Link
            href="/compose"
            className="flex h-10 items-center rounded-[var(--radius-sm)] bg-accent px-3.5 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover sm:px-5"
            id="nav-compose-cta"
          >
            <span className="sm:hidden">Write</span>
            <span className="hidden sm:inline">Write a letter</span>
          </Link>

          <NavMenu />
        </div>
      </nav>
    </header>
  );
}
