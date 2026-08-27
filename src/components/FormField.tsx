"use client";

import { useId } from "react";

/**
 * A labelled input with room for an error.
 *
 * The error is wired to the input with aria-describedby and aria-invalid, so
 * a screen reader hears why the field was rejected rather than just that
 * something on the page is red.
 */
export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  autoComplete,
  placeholder,
  required = true,
  disabled = false,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`w-full rounded-[var(--radius-sm)] border bg-surface px-3.5 py-2.5 text-ink
          placeholder:text-ink-muted transition-colors duration-200
          disabled:cursor-not-allowed disabled:opacity-60
          ${error ? "border-danger-line" : "border-line hover:border-line-strong"}`}
      />
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
