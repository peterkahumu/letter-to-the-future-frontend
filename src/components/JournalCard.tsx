import Link from "next/link";
import { NotebookPen } from "lucide-react";
import type { Journal } from "@/lib/api";
import { formatDate } from "@/lib/format";

/** Swatch per journal colour. Kept as a lookup rather than an interpolated
 *  class name, which Tailwind cannot see at build time and would purge. */
const SWATCH: Record<string, string> = {
  turquoise: "bg-[var(--turquoise-400)]",
  gold: "bg-[var(--stamp)]",
  rose: "bg-[#f0929a]",
  violet: "bg-[#b49bf0]",
  amber: "bg-[#f0b45a]",
  slate: "bg-[#8ba3a0]",
};

export default function JournalCard({ journal }: { journal: Journal }) {
  return (
    <Link
      href={`/dashboard/journals/${journal.id}`}
      className="group flex flex-col rounded-[var(--radius-md)] border border-line bg-surface p-5 transition-colors duration-200 hover:border-line-strong"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
            SWATCH[journal.color] ?? SWATCH.turquoise
          }`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg text-ink">
            {journal.title}
          </h2>
          {journal.description && (
            <p className="mt-1 line-clamp-2 text-xs text-ink-muted">
              {journal.description}
            </p>
          )}
        </div>
        {journal.is_archived && (
          <span className="shrink-0 rounded-[var(--radius-full)] border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">
            Archived
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
          {journal.entry_count}{" "}
          {journal.entry_count === 1 ? "entry" : "entries"}
        </span>
        {journal.last_entry_at && (
          <span>Last written {formatDate(journal.last_entry_at)}</span>
        )}
      </div>
    </Link>
  );
}
