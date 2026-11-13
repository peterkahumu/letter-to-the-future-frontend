import Link from "next/link";
import { EnvelopeIcon } from "@/components/icons";

/**
 * The shared frame for every account screen — sign in, sign up, reset.
 * One layout so the flow feels like one thing rather than five pages that
 * happen to have forms on them.
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-5 py-12 sm:px-8">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-accent text-accent-on"
          aria-label="Letter to the Future — home"
        >
          <EnvelopeIcon className="h-6 w-6" />
        </Link>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-md)] sm:p-8">
        {children}
      </div>

      {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
    </div>
  );
}
