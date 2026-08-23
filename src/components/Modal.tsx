"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** "lg" is for reading a letter; "md" suits short forms. */
  size?: "md" | "lg";
  children: React.ReactNode;
}

/**
 * Accessible dialog: Escape closes, focus moves in on open and returns to the
 * trigger on close, and Tab is kept inside while it's open.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => !el.hasAttribute("disabled"));

    focusable()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    // z-60 keeps the sheet above the sticky navbar (z-50), which used to crop
    // the top of a tall dialog on phones.
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-[var(--scrim)] p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={`animate-rise flex max-h-[88dvh] w-full flex-col rounded-t-[var(--radius-lg)] border border-line bg-elevated shadow-[var(--shadow-md)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)] ${
          size === "lg" ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="shrink-0 px-6 pt-6">
          <h2
            id="modal-title"
            className="font-display text-2xl leading-tight text-ink"
          >
            {title}
          </h2>
          {description && (
            <p id="modal-description" className="mt-2 text-sm leading-relaxed text-ink-soft">
              {description}
            </p>
          )}
        </div>
        {/* The body scrolls, so the title stays put and nothing is pushed
            off-screen behind the header on short viewports. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
          {children}
        </div>
      </div>
    </div>
  );
}
