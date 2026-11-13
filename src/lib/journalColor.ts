import type { JournalColor } from "@/lib/api";

/**
 * The dot that tells one notebook from another at a glance.
 *
 * Written out as whole class names rather than built from the colour at
 * runtime: Tailwind scans source text for class names, so an interpolated
 * `bg-journal-${color}` would be invisible to it and get purged from the
 * build — the dots would simply be transparent in production.
 *
 * Colour is never the only signal. Every swatch sits beside the journal's
 * title, so nothing is lost if the colours can't be told apart (1.4.1).
 */
export const JOURNAL_SWATCH: Record<JournalColor, string> = {
  turquoise: "bg-[var(--turquoise-400)]",
  gold: "bg-stamp",
  rose: "bg-journal-rose",
  violet: "bg-journal-violet",
  amber: "bg-journal-amber",
  slate: "bg-journal-slate",
};

/** Falls back to turquoise for a value stored before a colour was added. */
export function swatchFor(color: string): string {
  return JOURNAL_SWATCH[color as JournalColor] ?? JOURNAL_SWATCH.turquoise;
}
