/**
 * Static backdrop: a turquoise wash at the top of the page plus a faint
 * grid, so content sits on paper rather than on a flat block of colour.
 */
export default function PaperBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-x-0 top-0 h-[420px] opacity-70"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, var(--tint) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(100% 60% at 50% 0%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(100% 60% at 50% 0%, black 0%, transparent 75%)",
        }}
      />
    </div>
  );
}
