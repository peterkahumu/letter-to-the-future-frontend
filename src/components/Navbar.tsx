"use client";

import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import { useState } from "react";

const themeIcons: Record<string, string> = {
  light: "☀️",
  dark: "🌙",
  system: "💻",
};

const themeLabels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const themeOrder = ["light", "dark", "system"] as const;

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold transition-colors duration-200 hover:text-primary-500"
            id="nav-logo"
          >
            <span className="text-2xl">✉️</span>
            <span className="hidden sm:inline bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Letter to the Future
            </span>
            <span className="sm:hidden bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              LTTF
            </span>
          </Link>

          {/* Desktop actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium
                         text-text-secondary hover:text-text-primary
                         transition-all duration-200 hover:bg-primary-500/10
                         focus-ring"
              aria-label={`Current theme: ${themeLabels[theme]}. Click to switch.`}
              id="theme-toggle"
            >
              <span className="text-lg">{themeIcons[theme]}</span>
              <span className="hidden sm:inline">{themeLabels[theme]}</span>
            </button>

            {/* CTA */}
            <Link
              href="/compose"
              className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white
                         shadow-md transition-all duration-200
                         hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/25
                         active:scale-95 focus-ring"
              id="nav-compose-cta"
            >
              Write a Letter
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
