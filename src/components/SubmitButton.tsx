"use client";

import { Loader2 } from "lucide-react";

/** Primary action with a busy state. Disabled while working so a double
 *  click can't submit twice. */
export default function SubmitButton({
  children,
  busy = false,
  disabled = false,
  className = "",
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  busy?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)]
        bg-accent px-5 text-sm font-medium text-accent-on transition-colors duration-200
        hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
