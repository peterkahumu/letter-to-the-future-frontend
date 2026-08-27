"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api, ApiRequestError, type AdminReport } from "@/lib/api";
import Alert from "@/components/Alert";
import { formatDateTime } from "@/lib/format";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  sexual: "Sexual content",
  violence: "Violence",
  personal_info: "Personal information",
  other: "Other",
};

export default function ModerationPage() {
  const [reports, setReports] = useState<AdminReport[] | null>(null);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  // Bumped after a moderation action to re-run the fetch below.
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    api
      .getAdminReports(includeResolved)
      .then((rows) => {
        if (!cancelled) setReports(rows);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the moderation queue.");
      });

    return () => {
      cancelled = true;
    };
  }, [includeResolved, reloadCount]);

  async function moderate(letterId: string, hidden: boolean) {
    setWorking(letterId);
    setError("");
    try {
      await api.moderateLetter(letterId, hidden);
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Couldn't apply that."
      );
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Moderation</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Public letters readers have flagged.
        </p>
      </header>

      {error && <Alert>{error}</Alert>}

      <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line bg-elevated px-4 py-3">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-accent-text"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-ink-soft">
          Hiding takes a letter off the public board. It does not stop delivery
          — publishing was optional, delivery is the promise the service made
          to the person waiting for it.
        </p>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-ink-muted">
        <input
          type="checkbox"
          checked={includeResolved}
          onChange={(event) => setIncludeResolved(event.target.checked)}
          className="h-3.5 w-3.5 accent-[var(--accent)]"
        />
        Include already-hidden letters
      </label>

      {reports === null ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface/50 p-12 text-center">
          <ShieldCheck className="mx-auto h-6 w-6 text-ink-muted" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink">Nothing to review</p>
          <p className="mt-1.5 text-xs text-ink-muted">
            The queue is empty.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li
              key={report.letter_id}
              className="rounded-[var(--radius-md)] border border-line bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base text-ink">{report.subject}</h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    {report.sender_name ?? "Anonymous"} ·{" "}
                    {report.reported_count}{" "}
                    {report.reported_count === 1 ? "report" : "reports"}
                    {report.latest_report_at &&
                      ` · latest ${formatDateTime(report.latest_report_at)}`}
                  </p>
                </div>

                {report.is_hidden && (
                  <span className="shrink-0 rounded-[var(--radius-full)] border border-danger-line bg-danger-tint px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-danger">
                    Hidden
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {[...new Set(report.reasons)].map((reason) => (
                  <span
                    key={reason}
                    className="rounded-[var(--radius-full)] border border-line px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted"
                  >
                    {REASON_LABELS[reason] ?? reason}
                    {report.reasons.filter((r) => r === reason).length > 1 &&
                      ` ×${report.reasons.filter((r) => r === reason).length}`}
                  </span>
                ))}
              </div>

              {/* The body is shown because a moderator cannot judge a report
                  without seeing what was reported. It was published on
                  purpose — unlike a journal entry, which has no admin view. */}
              <div
                className="rich-text mt-4 max-h-40 overflow-y-auto rounded-[var(--radius-sm)] border border-line bg-paper p-4 text-sm leading-relaxed text-ink-soft"
                dangerouslySetInnerHTML={{ __html: report.body }}
              />

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => void moderate(report.letter_id, !report.is_hidden)}
                  disabled={working === report.letter_id}
                  className={`flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border px-4 text-sm transition-colors duration-200 disabled:opacity-60 ${
                    report.is_hidden
                      ? "border-line-strong text-ink-soft hover:border-line-hover hover:text-ink"
                      : "border-danger-line bg-danger-tint text-danger"
                  }`}
                >
                  {report.is_hidden ? (
                    <>
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      Restore to the board
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                      Hide from the board
                    </>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
