"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";
import { api, type LetterStatus, type LetterSummary } from "@/lib/api";
import Alert from "@/components/Alert";
import { STATUS_STYLES, formatDate, relativeDay } from "@/lib/format";

const FILTERS: Array<{ value: LetterStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "sent", label: "Delivered" },
  { value: "pending", label: "Unconfirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyLettersPage() {
  const [filter, setFilter] = useState<LetterStatus | "all">("all");
  // Results are stored with the filter they belong to. Anything else is
  // stale by definition, which makes "still loading" a comparison rather
  // than a second piece of state to keep in step.
  const [loaded, setLoaded] = useState<{
    filter: LetterStatus | "all";
    rows: LetterSummary[];
  } | null>(null);
  const [error, setError] = useState("");

  const letters = loaded?.filter === filter ? loaded.rows : null;

  useEffect(() => {
    let stale = false;

    api
      .getMyLetters(filter === "all" ? undefined : filter)
      .then((rows) => {
        // A slow earlier request must not overwrite a newer filter's result.
        if (!stale) setLoaded({ filter, rows });
      })
      .catch(() => {
        if (!stale) setError("Couldn't load your letters.");
      });

    return () => {
      stale = true;
    };
  }, [filter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Your letters</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Everything you&apos;ve sent forward in time.
          </p>
        </div>
        <Link
          href="/compose"
          className="flex h-10 items-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
        >
          Write a letter
        </Link>
      </header>

      {/* The concept, stated where it applies. A reader who wonders why
          there is no edit button should find the answer next to the list. */}
      <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line bg-elevated px-4 py-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink-soft">
          Letters can&apos;t be edited once written. A letter you could revise
          on the day it arrives wouldn&apos;t be from your past self — that&apos;s
          the whole point. You can still cancel one before it&apos;s delivered,
          using the manage link in your confirmation email.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`h-8 rounded-[var(--radius-full)] border px-3.5 text-xs transition-colors duration-200 ${
              filter === value
                ? "border-accent bg-tint text-accent-text"
                : "border-line-strong text-ink-muted hover:border-line-hover hover:text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}

      {letters === null ? (
        <ul className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="h-24 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface"
            />
          ))}
        </ul>
      ) : letters.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface/50 p-12 text-center">
          <Mail className="mx-auto h-6 w-6 text-ink-muted" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink">
            {filter === "all"
              ? "You haven't written any letters yet."
              : "Nothing here with that status."}
          </p>
          {filter === "all" && (
            <Link
              href="/compose"
              className="mt-4 inline-flex h-9 items-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
            >
              Write your first
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {letters.map((letter) => {
            const style = STATUS_STYLES[letter.status];
            return (
              <li
                key={letter.id}
                className="rounded-[var(--radius-md)] border border-line bg-surface p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="min-w-0 flex-1 text-sm text-ink sm:text-base">
                    {letter.subject}
                  </h2>
                  <span
                    className={`shrink-0 rounded-[var(--radius-full)] border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-ink-muted">
                  <div className="flex gap-1.5">
                    <dt>To</dt>
                    <dd className="text-ink-soft">
                      {letter.recipient_email_masked}
                    </dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt>{letter.status === "sent" ? "Delivered" : "Arrives"}</dt>
                    <dd className="text-ink-soft">
                      {formatDate(letter.sent_at ?? letter.deliver_at)}
                      {letter.status === "scheduled" && (
                        <span className="text-ink-muted">
                          {" "}
                          ({relativeDay(letter.deliver_at)})
                        </span>
                      )}
                    </dd>
                  </div>
                  {letter.is_public && (
                    <div className="flex gap-1.5">
                      <dt className="sr-only">Visibility</dt>
                      <dd className="text-accent-text">On the public board</dd>
                    </div>
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
