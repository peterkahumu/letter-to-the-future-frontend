"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { api, ApiRequestError, type LetterPayload } from "@/lib/api";
import {
  ArrowRightIcon,
  CollapseIcon,
  ExpandIcon,
  LockIcon,
} from "@/components/icons";

interface FormErrors {
  recipient_email?: string;
  sender_name?: string;
  subject?: string;
  body?: string;
  deliver_at?: string;
  general?: string;
}

const MAX_BODY_LENGTH = 50000;

// Quick-pick horizons, so nobody has to reach for a calendar to get started.
const DELIVERY_PRESETS = [
  { label: "6 months", months: 6 },
  { label: "1 year", months: 12 },
  { label: "3 years", months: 36 },
  { label: "5 years", months: 60 },
  { label: "10 years", months: 120 },
];

/** Local-time ISO date. toISOString() shifts the day either side of UTC. */
function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dateInMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}

const railFieldClasses =
  "w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3.5 py-2.5 text-base text-ink placeholder:text-ink-muted transition-colors duration-200 hover:border-line-strong focus:border-accent focus:outline-none";

const railLabelClasses =
  "block text-xs font-medium uppercase tracking-[0.16em] text-ink-muted";

export default function LetterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusMode, setFocusMode] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<LetterPayload>({
    recipient_email: "",
    sender_name: "",
    subject: "",
    body: "",
    deliver_at: "",
  });

  // Full-screen writing: lock the page behind it and let Escape back out.
  useEffect(() => {
    if (!focusMode) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocusMode(false);
    };

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    bodyRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [focusMode]);

  const updateField = (field: keyof LetterPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.recipient_email) {
      newErrors.recipient_email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipient_email)) {
      newErrors.recipient_email = "Please enter a valid email address.";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!form.body.trim()) {
      newErrors.body = "Your letter cannot be empty.";
    } else if (form.body.length > MAX_BODY_LENGTH) {
      newErrors.body = `Letter is too long (${form.body.length}/${MAX_BODY_LENGTH} characters).`;
    }

    if (!form.deliver_at) {
      newErrors.deliver_at = "Please choose a delivery date.";
    } else if (form.deliver_at < getTomorrowDate()) {
      newErrors.deliver_at = "Delivery date must be in the future.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Errors live outside the editor, so drop out of full screen to show them.
      setFocusMode(false);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: LetterPayload = {
        ...form,
        sender_name: form.sender_name.trim() || "Past You",
      };
      const response = await api.createLetter(payload);
      router.push(`/confirmation/${response.id}`);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Full screen spans the viewport; keep each row at a readable measure.
  const measure = focusMode ? "mx-auto w-full max-w-3xl" : "";

  const editor = (
    <section
      className={
        focusMode
          ? "fixed inset-0 z-50 flex flex-col bg-elevated"
          : "relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-elevated shadow-[var(--shadow-lg)]"
      }
    >
      {!focusMode && <div className="perforated-top" />}

      <div className="border-b border-line">
        <div
          className={`flex items-center justify-between gap-3 px-5 py-3 sm:px-7 ${measure}`}
        >
          <span className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            Your letter
          </span>
          <button
            type="button"
            onClick={() => setFocusMode((open) => !open)}
            className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-sm text-ink-soft transition-colors duration-200 hover:text-accent-text"
            id="focus-mode-toggle"
          >
            {focusMode ? (
              <>
                <CollapseIcon className="h-4 w-4" />
                Exit full screen
              </>
            ) : (
              <>
                <ExpandIcon className="h-4 w-4" />
                Full screen
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className={`flex flex-1 flex-col overflow-hidden px-5 py-5 sm:px-7 sm:py-6 ${measure}`}
      >
        <input
          type="text"
          form="letter-form"
          id="subject"
          placeholder="Subject"
          aria-label="Subject"
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          maxLength={500}
          aria-invalid={Boolean(errors.subject)}
          className="w-full bg-transparent font-display text-xl text-ink placeholder:text-ink-muted focus:outline-none sm:text-2xl"
        />

        <textarea
          ref={bodyRef}
          form="letter-form"
          id="body"
          placeholder={"Dear future me,\n\nI'm writing this because..."}
          aria-label="Your letter"
          value={form.body}
          onChange={(e) => updateField("body", e.target.value)}
          maxLength={MAX_BODY_LENGTH}
          aria-invalid={Boolean(errors.body)}
          className={`mt-5 w-full flex-1 resize-none bg-transparent text-base leading-[32px] text-ink placeholder:text-ink-muted focus:outline-none ${
            focusMode ? "min-h-0" : "min-h-[300px] sm:min-h-[380px]"
          }`}
        />
      </div>

      <div className="border-t border-line">
        <div
          className={`flex items-center justify-between gap-4 px-5 py-3 text-sm sm:px-7 ${measure}`}
        >
          <span className="text-danger">{errors.subject || errors.body}</span>
          <span className="shrink-0 tabular-nums text-ink-muted">
            {form.body.length.toLocaleString()} /{" "}
            {MAX_BODY_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );

  return (
    <form
      onSubmit={handleSubmit}
      id="letter-form"
      noValidate
      className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10"
    >
      {focusMode ? createPortal(editor, document.body) : editor}

      {/* Delivery rail */}
      <aside className="flex flex-col gap-7 lg:sticky lg:top-24">
        {errors.general && (
          <p
            role="alert"
            className="animate-fade rounded-[var(--radius-sm)] border border-danger-line bg-danger-tint px-4 py-3 text-sm text-danger"
            id="form-error"
          >
            {errors.general}
          </p>
        )}

        <div>
          <span className={railLabelClasses}>Deliver in</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {DELIVERY_PRESETS.map(({ label, months }) => {
              const value = dateInMonths(months);
              const active = form.deliver_at === value;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateField("deliver_at", value)}
                  aria-pressed={active}
                  className={`rounded-[var(--radius-full)] border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
                    active
                      ? "border-accent bg-accent text-accent-on"
                      : "border-line text-ink-soft hover:border-accent hover:text-accent-text"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <label
            htmlFor="deliver_at"
            className="mt-5 block text-sm font-medium text-ink"
          >
            Or choose a date
          </label>
          <input
            type="date"
            id="deliver_at"
            value={form.deliver_at}
            onChange={(e) => updateField("deliver_at", e.target.value)}
            min={getTomorrowDate()}
            aria-invalid={Boolean(errors.deliver_at)}
            className={`${railFieldClasses} mt-2`}
          />
          {errors.deliver_at && (
            <p role="alert" className="mt-1.5 text-sm text-danger">
              {errors.deliver_at}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="recipient_email" className={railLabelClasses}>
            Make sure you get it
          </label>
          <input
            type="email"
            id="recipient_email"
            placeholder="you@example.com"
            value={form.recipient_email}
            onChange={(e) => updateField("recipient_email", e.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.recipient_email)}
            className={`${railFieldClasses} mt-3`}
          />
          {errors.recipient_email && (
            <p role="alert" className="mt-1.5 text-sm text-danger">
              {errors.recipient_email}
            </p>
          )}

          <label
            htmlFor="sender_name"
            className="mt-5 block text-sm font-medium text-ink"
          >
            Signed <span className="font-light text-ink-muted">optional</span>
          </label>
          <input
            type="text"
            id="sender_name"
            placeholder="Past You"
            value={form.sender_name}
            onChange={(e) => updateField("sender_name", e.target.value)}
            maxLength={150}
            className={`${railFieldClasses} mt-2`}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent px-6 py-3.5 text-base font-medium text-accent-on shadow-[var(--shadow-md)] transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            id="submit-letter"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Sealing your letter…
              </>
            ) : (
              <>
                Send to the future
                <ArrowRightIcon className="h-[18px] w-[18px]" />
              </>
            )}
          </button>

          <p className="mt-4 flex items-start gap-2.5 text-sm text-ink-muted">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Stored privately and sent only to the address above.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
