"use client";

import { useEffect, useRef, type PointerEvent } from "react";

// Kept deliberately small — enough to feel responsive, not enough to distract.
const MAX_TILT_DEGREES = 4;

/**
 * The hero graphic: a stack of paper with a letter mid-composition, including
 * a signature that draws itself in. Leans toward the cursor on pointer devices.
 */
export default function LetterCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltEnabled = useRef(false);

  useEffect(() => {
    tiltEnabled.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || !tiltEnabled.current) return;

    const bounds = card.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    card.style.setProperty("--tilt-y", `${offsetX * MAX_TILT_DEGREES}deg`);
    card.style.setProperty("--tilt-x", `${-offsetY * MAX_TILT_DEGREES}deg`);
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--tilt-x", "0deg");
  };

  return (
    <div className="relative mx-auto max-w-md lg:mx-0">
      {/* Sheets stacked underneath, for depth */}
      <div
        className="absolute inset-x-4 -bottom-3 h-24 rounded-[var(--radius-lg)] border border-line bg-surface"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-2 -bottom-1.5 h-24 rounded-[var(--radius-lg)] border border-line bg-elevated"
        aria-hidden="true"
      />

      <div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="tilt relative rounded-[var(--radius-lg)] border border-line bg-elevated shadow-[var(--shadow-lg)]"
      >
        <div className="perforated-top" />

        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
              Delivering to
            </p>
            <p className="mt-1.5 text-sm text-ink">you@example.com</p>
          </div>
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-accent text-accent-text">
            <span className="font-display text-lg leading-none">01</span>
            <span className="text-[0.6rem] uppercase tracking-widest">Jan</span>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="font-display text-lg text-ink">Dear future me,</p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            I hope you kept the habit of writing things down. Here is what today
            looked like, so you have something to compare it to.
          </p>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <Signature />
              <p className="mt-1 text-sm text-ink-muted">— Past you</p>
            </div>
            <Nib />
          </div>
        </div>
      </div>
    </div>
  );
}

function Signature() {
  return (
    <svg
      viewBox="0 0 130 30"
      className="h-7 w-[130px] text-accent-display"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 22C11 6 17 27 25 13c7-12 13 8 20-2 6-9 12 10 19 1 6-8 13 9 20 2 6-6 13 4 20-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={220}
        className="animate-signature"
      />
    </svg>
  );
}

function Nib() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0 text-ink-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h4L19.5 8.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 6.5 17.5 9.5" />
    </svg>
  );
}
