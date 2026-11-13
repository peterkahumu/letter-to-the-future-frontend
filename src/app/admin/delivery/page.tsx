"use client";

import { useEffect, useState } from "react";
import { MailX, RefreshCw, Undo2 } from "lucide-react";
import {
  api,
  ApiRequestError,
  type AdminDeliveryLog,
  type AdminSuppression,
} from "@/lib/api";
import Alert from "@/components/Alert";
import { formatDate, formatDateTime } from "@/lib/format";

type Tab = "logs" | "failed" | "suppressions";

export default function DeliveryPage() {
  const [tab, setTab] = useState<Tab>("logs");
  const [logs, setLogs] = useState<AdminDeliveryLog[] | null>(null);
  const [failed, setFailed] = useState<AdminDeliveryLog[] | null>(null);
  const [suppressions, setSuppressions] = useState<AdminSuppression[] | null>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  // Bumped by the Refresh button to re-run the fetch below.
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetching =
      tab === "logs"
        ? api.getDeliveryLogs().then((rows) => () => setLogs(rows))
        : tab === "failed"
          ? api.getFailedLetters().then((rows) => () => setFailed(rows))
          : api.getSuppressions().then((rows) => () => setSuppressions(rows));

    fetching
      .then((apply) => {
        if (cancelled) return;
        setError("");
        apply();
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load that.");
      });

    return () => {
      cancelled = true;
    };
  }, [tab, reloadCount]);

  async function retry(letterId: string) {
    setWorking(letterId);
    try {
      await api.retryLetter(letterId);
      setFailed((current) =>
        (current ?? []).filter((row) => row.letter_id !== letterId)
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Couldn't requeue it."
      );
    } finally {
      setWorking(null);
    }
  }

  async function lift(email: string) {
    setWorking(email);
    try {
      await api.removeSuppression(email);
      setSuppressions((current) =>
        (current ?? []).filter((row) => row.email !== email)
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Couldn't lift it."
      );
    } finally {
      setWorking(null);
    }
  }

  const tabs: Array<{ value: Tab; label: string }> = [
    { value: "logs", label: "Recent attempts" },
    { value: "failed", label: "Failed" },
    { value: "suppressions", label: "Suppressed addresses" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Delivery</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            What went out, what didn&apos;t, and who has opted out.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadCount((count) => count + 1)}
          className="flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-line-strong px-4 text-sm text-ink-soft transition-colors duration-200 hover:border-line-hover hover:text-ink"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </header>

      {error && <Alert>{error}</Alert>}

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Delivery views">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={`h-8 rounded-[var(--radius-full)] border px-3.5 text-xs transition-colors duration-200 ${
              tab === value
                ? "border-accent bg-tint text-accent-text"
                : "border-line-strong text-ink-muted hover:border-line-hover hover:text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "logs" && (
        <LogTable
          rows={logs}
          empty="No delivery attempts recorded yet."
          renderAction={() => null}
        />
      )}

      {tab === "failed" && (
        <LogTable
          rows={failed}
          empty="Nothing has failed. "
          renderAction={(row) => (
            <button
              type="button"
              onClick={() => void retry(row.letter_id)}
              disabled={working === row.letter_id}
              className="flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-line-strong px-3 text-xs text-ink-soft transition-colors duration-200 hover:border-line-hover hover:text-ink disabled:opacity-50"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              Requeue
            </button>
          )}
        />
      )}

      {tab === "suppressions" && (
        <>
          <p className="max-w-prose text-xs leading-relaxed text-ink-muted">
            Lift a suppression for a bounce that turned out to be a mail server
            having a bad day — not for an unsubscribe. Removing one of those
            puts an address back on a list it explicitly asked to leave.
          </p>

          {suppressions === null ? (
            <div className="h-40 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface" />
          ) : suppressions.length === 0 ? (
            <EmptyState>No addresses are suppressed.</EmptyState>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-elevated text-left">
                    <th className="px-4 py-3 font-medium text-ink-soft">Address</th>
                    <th className="px-4 py-3 font-medium text-ink-soft">Reason</th>
                    <th className="px-4 py-3 font-medium text-ink-soft">Since</th>
                    <th className="px-4 py-3 text-right font-medium text-ink-soft">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suppressions.map((row) => (
                    <tr
                      key={row.email}
                      className="border-b border-line last:border-0 hover:bg-surface"
                    >
                      <td className="px-4 py-3 text-ink">{row.email}</td>
                      <td className="px-4 py-3 text-xs text-ink-muted">
                        {row.reason}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void lift(row.email)}
                          disabled={working === row.email}
                          className="h-8 rounded-[var(--radius-sm)] border border-line-strong px-3 text-xs text-ink-soft transition-colors duration-200 hover:border-line-hover hover:text-ink disabled:opacity-50"
                        >
                          Lift
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LogTable({
  rows,
  empty,
  renderAction,
}: {
  rows: AdminDeliveryLog[] | null;
  empty: string;
  renderAction: (row: AdminDeliveryLog) => React.ReactNode;
}) {
  if (rows === null) {
    return (
      <div className="h-64 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface" />
    );
  }

  if (rows.length === 0) return <EmptyState>{empty}</EmptyState>;

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-elevated text-left">
            <th className="px-4 py-3 font-medium text-ink-soft">Letter</th>
            <th className="px-4 py-3 font-medium text-ink-soft">Outcome</th>
            <th className="px-4 py-3 font-medium text-ink-soft">When</th>
            <th className="px-4 py-3 text-right font-medium text-ink-soft" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-line last:border-0 hover:bg-surface"
            >
              <td className="px-4 py-3">
                <p className="text-ink">{row.subject ?? "—"}</p>
                <p className="text-xs text-ink-muted">
                  {row.recipient_email_masked ?? "—"}
                </p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-[var(--radius-full)] border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    row.outcome === "accepted"
                      ? "border-line-strong bg-tint text-accent-text"
                      : "border-danger-line bg-danger-tint text-danger"
                  }`}
                >
                  {row.outcome}
                </span>
                {row.detail && (
                  <p className="mt-1 max-w-xs truncate text-xs text-ink-muted">
                    {row.detail}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-ink-muted">
                {formatDateTime(row.attempted_at)}
              </td>
              <td className="px-4 py-3 text-right">{renderAction(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface/50 p-12 text-center">
      <MailX className="mx-auto h-6 w-6 text-ink-muted" aria-hidden="true" />
      <p className="mt-3 text-sm text-ink-muted">{children}</p>
    </div>
  );
}
