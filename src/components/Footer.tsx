import Link from "next/link";
import { EnvelopeIcon } from "@/components/icons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2.5">
          <EnvelopeIcon className="h-5 w-5 text-accent-text" />
          <span className="font-display text-base text-ink">
            Letter to the Future
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <Link
            href="/"
            className="transition-colors duration-200 hover:text-accent-text"
          >
            Home
          </Link>
          <Link
            href="/compose"
            className="transition-colors duration-200 hover:text-accent-text"
          >
            Compose
          </Link>
        </nav>

        <p className="text-sm text-ink-muted">© {year} Letter to the Future</p>
      </div>
    </footer>
  );
}
