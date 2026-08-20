"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import {
  EnvelopeIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "@/components/icons";

const themeOrder = ["light", "dark", "system"] as const;

const themeMeta = {
  light: { label: "Light", Icon: SunIcon },
  dark: { label: "Dark", Icon: MoonIcon },
  system: { label: "System", Icon: MonitorIcon },
} as const;

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { label, Icon } = themeMeta[theme];

  const cycleTheme = () => {
    const next = (themeOrder.indexOf(theme) + 1) % themeOrder.length;
    setTheme(themeOrder[next]);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          id="nav-logo"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-accent-on">
            <EnvelopeIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-base leading-none text-ink sm:text-lg">
            Letter to the Future
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={cycleTheme}
            className="flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border border-line px-2.5 text-sm text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink sm:px-3"
            aria-label={`Theme: ${label}. Activate to change.`}
            id="theme-toggle"
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">{label}</span>
          </button>

          <Link
            href="/public"
            className="flex h-9 items-center rounded-[var(--radius-sm)] border border-line px-2.5 text-sm text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink sm:px-3"
          >
            <span className="sm:hidden">Board</span>
            <span className="hidden sm:inline">Public Board</span>
          </Link>

          <Link
            href="/compose"
            className="flex h-9 items-center rounded-[var(--radius-sm)] bg-accent px-3.5 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover sm:px-5"
            id="nav-compose-cta"
          >
            <span className="sm:hidden">Write</span>
            <span className="hidden sm:inline">Write a letter</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
