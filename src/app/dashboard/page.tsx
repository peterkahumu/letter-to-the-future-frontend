"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarClock, Flame, Mail, NotebookPen, Send } from "lucide-react";
import { api, type Dashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import StatTile from "@/components/StatTile";
import Alert from "@/components/Alert";
import { STATUS_STYLES, formatDate, relativeDay } from "@/lib/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch(() => setError("Couldn't load your dashboard. Try refreshing."));
  }, []);

  if (error) return <Alert>{error}</Alert>;

  if (!data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  const firstName = (user?.display_name || "").split(" ")[0];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          {firstName ? `Hello, ${firstName}` : "Your dashboard"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Letters are sealed once confirmed. Journals are yours to rewrite.
        </p>
      </header>

      {!user?.is_verified && (
        <Alert tone="info">
          Your email address isn&apos;t confirmed yet. Check your inbox, or{" "}
          <Link
            href="/dashboard/settings"
            className="text-accent-text underline hover:text-accent-hover"
          >
            send a fresh link
          </Link>
          .
        </Alert>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Letters"
          value={data.letters_total}
          hint={`${data.letters_sent} delivered`}
          icon={Mail}
        />
        <StatTile
          label="Scheduled"
          value={data.letters_scheduled}
          hint={
            data.next_delivery
              ? `Next ${relativeDay(data.next_delivery)}`
              : "Nothing queued"
          }
          icon={CalendarClock}
        />
        <StatTile
          label="Entries"
          value={data.entries_total}
          hint={`${data.entries_this_month} this month`}
          icon={NotebookPen}
        />
        <StatTile
          label="Streak"
          value={data.current_streak === 0 ? "—" : `${data.current_streak}d`}
          hint={
            data.current_streak > 0 ? "Days in a row" : "Write today to start one"
          }
          icon={Flame}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl text-ink">Recent letters</h2>
            <Link
              href="/dashboard/letters"
              className="text-xs text-accent-text hover:text-accent-hover"
            >
              See all
            </Link>
          </div>

          {data.recent_letters.length === 0 ? (
            <EmptyPanel
              icon={Send}
              title="No letters yet"
              action={{ href: "/compose", label: "Write one" }}
            >
              Pick a date, write to whoever you&apos;ll be then, and we&apos;ll
              deliver it.
            </EmptyPanel>
          ) : (
            <ul className="space-y-2">
              {data.recent_letters.map((letter) => {
                const style = STATUS_STYLES[letter.status];
                return (
                  <li
                    key={letter.id}
                    className="rounded-[var(--radius-md)] border border-line bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm text-ink">
                        {letter.subject}
                      </p>
                      <span
                        className={`shrink-0 rounded-[var(--radius-full)] border px-2 py-0.5 text-[10px] uppercase tracking-wider ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-muted">
                      To {letter.recipient_email_masked} ·{" "}
                      {formatDate(letter.deliver_at)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl text-ink">Recent entries</h2>
            <Link
              href="/dashboard/journals"
              className="text-xs text-accent-text hover:text-accent-hover"
            >
              See all
            </Link>
          </div>

          {data.recent_entries.length === 0 ? (
            <EmptyPanel
              icon={NotebookPen}
              title="No entries yet"
              action={{ href: "/dashboard/journals", label: "Start a journal" }}
            >
              Somewhere to think out loud — and unlike a letter, you can come
              back and change your mind.
            </EmptyPanel>
          ) : (
            <ul className="space-y-2">
              {data.recent_entries.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/dashboard/journals/${entry.journal_id}`}
                    className="block rounded-[var(--radius-md)] border border-line bg-surface p-4 transition-colors duration-200 hover:border-line-strong"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm text-ink">
                        {entry.title || "Untitled entry"}
                      </p>
                      <span className="shrink-0 text-xs text-ink-muted">
                        {formatDate(entry.entry_date)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-ink-muted">
                      {entry.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  action: { href: string; label: string };
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface/50 p-8 text-center">
      <Icon className="mx-auto h-6 w-6 text-ink-muted" aria-hidden="true" />
      <p className="mt-3 text-sm text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-xs text-ink-muted">{children}</p>
      <Link
        href={action.href}
        className="mt-4 inline-flex h-9 items-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
      >
        {action.label}
      </Link>
    </div>
  );
}
