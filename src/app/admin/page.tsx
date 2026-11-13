"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Flag,
  Mail,
  NotebookPen,
  Users,
} from "lucide-react";
import { api, type AdminStats } from "@/lib/api";
import StatTile from "@/components/StatTile";
import Alert from "@/components/Alert";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAdminStats()
      .then(setStats)
      .catch(() => setError("Couldn't load the statistics."));
  }, []);

  if (error) return <Alert>{error}</Alert>;

  if (!stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl text-ink">Overview</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Counts across the whole service.
        </p>
      </header>

      {stats.reports_open > 0 && (
        <Alert tone="error">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {stats.reports_open} reported{" "}
            {stats.reports_open === 1 ? "letter is" : "letters are"} waiting for
            review.{" "}
            <Link href="/admin/moderation" className="underline">
              Open the queue
            </Link>
          </span>
        </Alert>
      )}

      <section>
        <h2 className="eyebrow mb-3">People</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Users"
            value={stats.users_total}
            hint={`${stats.users_active} active`}
            icon={Users}
          />
          <StatTile
            label="Verified"
            value={stats.users_verified}
            hint={`of ${stats.users_total}`}
          />
          <StatTile label="Admins" value={stats.admins_total} />
          <StatTile
            label="New this week"
            value={stats.new_users_this_week}
            hint="Sign-ups"
          />
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-3">Letters</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Total"
            value={stats.letters_total}
            hint={`${stats.letters_guest} written by guests`}
            icon={Mail}
          />
          <StatTile
            label="Scheduled"
            value={stats.letters_scheduled}
            hint={`${stats.due_next_7_days} due in 7 days`}
            icon={CalendarClock}
          />
          <StatTile label="Delivered" value={stats.letters_sent} />
          <StatTile
            label="Failed"
            value={stats.letters_failed}
            hint={stats.letters_failed > 0 ? "Needs attention" : "All clear"}
          />
          <StatTile label="Unconfirmed" value={stats.letters_pending} />
          <StatTile label="Cancelled" value={stats.letters_cancelled} />
          <StatTile
            label="Hidden"
            value={stats.letters_hidden}
            hint="Off the public board"
            icon={Flag}
          />
          <StatTile
            label="Suppressed"
            value={stats.suppressions_total}
            hint="Addresses opted out"
          />
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-3">Journals</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Journals"
            value={stats.journals_total}
            icon={NotebookPen}
          />
          <StatTile label="Entries" value={stats.entries_total} />
        </div>
        <p className="mt-3 max-w-prose text-xs leading-relaxed text-ink-muted">
          Counts only. Journals and diary entries are private to the people who
          wrote them — there is no admin view of their contents anywhere in
          this service, and the API has no route that would return one.
        </p>
      </section>
    </div>
  );
}
