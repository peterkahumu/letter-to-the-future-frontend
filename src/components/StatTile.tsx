/**
 * One number and what it counts.
 *
 * The number is the display face at a large size and the label sits under
 * it in small caps, so a row of these reads as a row of figures rather than
 * a row of sentences.
 */
export default function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-ink-muted" />}
      </div>
      <p className="mt-2 font-display text-3xl leading-none text-ink">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
