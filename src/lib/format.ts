/** Date and status formatting shared by the dashboard and admin screens. */

import type { LetterStatus } from "@/lib/api";

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "in 3 months" / "2 days ago" — plain relative phrasing. */
export function relativeDay(iso: string | null): string {
  if (!iso) return "";
  const target = new Date(iso);
  const days = Math.round(
    (target.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(days) < 30) return formatter.format(days, "day");
  if (Math.abs(days) < 365) return formatter.format(Math.round(days / 30), "month");
  return formatter.format(Math.round(days / 365), "year");
}

/** Colour and wording for a letter's lifecycle state. */
export const STATUS_STYLES: Record<
  LetterStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Awaiting confirmation",
    className: "bg-elevated text-ink-muted border-line",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-tint text-accent-text border-line-strong",
  },
  sent: {
    label: "Delivered",
    className: "bg-tint text-accent-display border-line-strong",
  },
  failed: {
    label: "Failed",
    className: "bg-danger-tint text-danger border-danger-line",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-elevated text-ink-muted border-line",
  },
};
