import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl">✉️</span>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Letter to the Future
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <Link
              href="/"
              className="hover:text-primary-500 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/compose"
              className="hover:text-primary-500 transition-colors duration-200"
            >
              Compose
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-text-muted">
            © {year} Letter to the Future
          </p>
        </div>
      </div>
    </footer>
  );
}
