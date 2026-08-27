/**
 * Inline feedback. `role="alert"` on the error tone so a screen reader
 * announces a failed submit without the user having to go looking for it.
 */
export default function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "border-danger-line bg-danger-tint text-danger",
    success: "border-line-strong bg-tint text-accent-text",
    info: "border-line bg-elevated text-ink-soft",
  }[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-[var(--radius-sm)] border px-3.5 py-3 text-sm ${styles}`}
    >
      {children}
    </div>
  );
}
