"use client";

import { api, ApiRequestError, type LetterPayload } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface FormErrors {
  recipient_email?: string;
  sender_name?: string;
  subject?: string;
  body?: string;
  deliver_at?: string;
  general?: string;
}

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const MAX_BODY_LENGTH = 50000;

export default function LetterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<LetterPayload>({
    recipient_email: "",
    sender_name: "",
    subject: "",
    body: "",
    deliver_at: "",
  });

  const updateField = (field: keyof LetterPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
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
    } else {
      const chosen = new Date(form.deliver_at);
      const tomorrow = new Date(getTomorrowDate());
      if (chosen < tomorrow) {
        newErrors.deliver_at = "Delivery date must be in the future.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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

  const inputBaseClasses = `
    w-full rounded-[var(--radius-md)] px-4 py-3
    bg-[var(--bg-elevated)] border border-[var(--border-default)]
    text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
    hover:border-primary-500/30
  `;

  const labelClasses =
    "block text-sm font-medium text-text-secondary mb-1.5";

  const errorClasses = "text-sm text-red-400 mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="letter-form">
      {/* General error */}
      {errors.general && (
        <div
          className="rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in"
          id="form-error"
        >
          {errors.general}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="recipient_email" className={labelClasses}>
          Your Email
        </label>
        <input
          type="email"
          id="recipient_email"
          placeholder="future-you@example.com"
          value={form.recipient_email}
          onChange={(e) => updateField("recipient_email", e.target.value)}
          className={inputBaseClasses}
          autoComplete="email"
        />
        {errors.recipient_email && (
          <p className={errorClasses}>{errors.recipient_email}</p>
        )}
      </div>

      {/* Sender name */}
      <div>
        <label htmlFor="sender_name" className={labelClasses}>
          From <span className="text-text-muted">(optional)</span>
        </label>
        <input
          type="text"
          id="sender_name"
          placeholder="Past You"
          value={form.sender_name}
          onChange={(e) => updateField("sender_name", e.target.value)}
          className={inputBaseClasses}
          maxLength={150}
        />
        {errors.sender_name && (
          <p className={errorClasses}>{errors.sender_name}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className={labelClasses}>
          Subject
        </label>
        <input
          type="text"
          id="subject"
          placeholder="A message to future me..."
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          className={inputBaseClasses}
          maxLength={500}
        />
        {errors.subject && <p className={errorClasses}>{errors.subject}</p>}
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className={labelClasses}>
          Your Letter
        </label>
        <textarea
          id="body"
          placeholder="Dear future me,&#10;&#10;I'm writing this because..."
          value={form.body}
          onChange={(e) => updateField("body", e.target.value)}
          className={`${inputBaseClasses} min-h-[200px] sm:min-h-[280px]`}
          maxLength={MAX_BODY_LENGTH}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.body ? (
            <p className={errorClasses}>{errors.body}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-text-muted">
            {form.body.length.toLocaleString()}/{MAX_BODY_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Delivery date */}
      <div>
        <label htmlFor="deliver_at" className={labelClasses}>
          Deliver On
        </label>
        <input
          type="date"
          id="deliver_at"
          value={form.deliver_at}
          onChange={(e) => updateField("deliver_at", e.target.value)}
          min={getTomorrowDate()}
          className={inputBaseClasses}
        />
        {errors.deliver_at && (
          <p className={errorClasses}>{errors.deliver_at}</p>
        )}
        <p className="text-xs text-text-muted mt-1">
          Your letter will arrive on this date (UTC).
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-[var(--radius-md)] bg-primary-600 px-6 py-3.5
                   text-white font-semibold text-base
                   shadow-lg shadow-primary-600/20
                   transition-all duration-200
                   hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30
                   active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
                   focus-ring"
        id="submit-letter"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending to the future…
          </span>
        ) : (
          "Send to the Future ✨"
        )}
      </button>
    </form>
  );
}
