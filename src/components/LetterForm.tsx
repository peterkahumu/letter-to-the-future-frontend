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
import RichTextEditor from "./RichTextEditor";
import { Paperclip, Loader2, Image as ImageIcon } from "lucide-react";

interface FormErrors {
  recipient_email?: string;
  sender_name?: string;
  subject?: string;
  body?: string;
  deliver_at?: string;
  general?: string;
}

const MAX_BODY_LENGTH = 50000;

const DELIVERY_PRESETS = [
  { label: "6 months", months: 6 },
  { label: "1 year", months: 12 },
  { label: "3 years", months: 36 },
  { label: "5 years", months: 60 },
  { label: "10 years", months: 120 },
  { label: "Surprise Me (1-5 years)", randomRange: [12, 60] },
];

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

function getRandomDateInMonths(minMonths: number, maxMonths: number): string {
  const months = Math.floor(Math.random() * (maxMonths - minMonths + 1)) + minMonths;
  return dateInMonths(months);
}

// The backend validates deliver_at against the current *UTC* date, so the
// floor here must be UTC today too — otherwise a user west of UTC could pick
// their local today, send a UTC-yesterday date, and get a 422.
function getEarliestDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const railFieldClasses =
  "w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3.5 py-2.5 text-base text-ink placeholder:text-ink-muted transition-colors duration-200 hover:border-line-strong focus:border-accent focus:outline-none";

const railLabelClasses =
  "block text-xs font-medium uppercase tracking-[0.16em] text-ink-muted";

export default function LetterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusMode, setFocusMode] = useState(false);

  const [form, setForm] = useState<LetterPayload>({
    recipient_email: "",
    sender_name: "",
    subject: "",
    body: "",
    deliver_at: "",
    is_public: false,
    is_anonymous: true,
    media_url: null,
  });

  const [surpriseLabel, setSurpriseLabel] = useState("");

  useEffect(() => {
    if (!focusMode) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocusMode(false);
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [focusMode]);

  const updateField = (field: keyof LetterPayload, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, general: "File size must be less than 10MB." });
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await api.uploadMedia(file);
      updateField("media_url", url);
    } catch (err) {
      setErrors({ ...errors, general: "Failed to upload file. Please try again." });
    } finally {
      setIsUploading(false);
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

    const strippedBody = form.body.replace(/<[^>]+>/g, "").trim();
    if (!strippedBody && !form.media_url) {
      newErrors.body = "Your letter cannot be empty.";
    } else if (form.body.length > MAX_BODY_LENGTH) {
      newErrors.body = `Letter is too long.`;
    }

    if (!form.deliver_at) {
      newErrors.deliver_at = "Please choose a delivery date.";
    } else if (form.deliver_at < getEarliestDate()) {
      newErrors.deliver_at = "Delivery date cannot be in the past.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
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

  const measure = focusMode ? "mx-auto w-full max-w-3xl h-full flex flex-col" : "";

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
          className={`flex items-center justify-between gap-3 px-5 py-3 sm:px-7 ${
            focusMode ? "mx-auto w-full max-w-3xl" : ""
          }`}
        >
          <span className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            Your letter
          </span>
          <button
            type="button"
            onClick={() => setFocusMode((open) => !open)}
            className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-sm text-ink-soft transition-colors duration-200 hover:text-accent-text"
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
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          maxLength={500}
          className="w-full bg-transparent font-display text-xl text-ink placeholder:text-ink-muted focus:outline-none sm:text-2xl"
        />

        <RichTextEditor 
          content={form.body}
          onChange={(content) => updateField("body", content)}
          placeholder="Dear future me,&#10;&#10;I'm writing this because..."
          focusMode={focusMode}
        />
        
        {/* Media Upload Area */}
        <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-accent-text cursor-pointer hover:text-accent-hover transition-colors font-medium bg-accent/5 px-3 py-1.5 rounded-full border border-accent/20">
              <Paperclip size={16} />
              <span>{form.media_url ? "Change Attachment" : "Attach File"}</span>
              <input 
                type="file" 
                accept="image/*, audio/*, video/*" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isUploading}
              />
            </label>
            
            {isUploading && (
              <span className="flex items-center gap-2 text-sm text-ink-muted">
                <Loader2 size={16} className="animate-spin" /> Uploading...
              </span>
            )}
            
            {!isUploading && form.media_url && (
              <span className="flex items-center gap-1.5 text-sm text-ink-soft bg-surface px-3 py-1.5 rounded-full">
                <ImageIcon size={14} /> Attached
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-surface/50">
        <div
          className={`flex items-center justify-between gap-4 px-5 py-3 text-sm sm:px-7 ${
            focusMode ? "mx-auto w-full max-w-3xl" : ""
          }`}
        >
          <span className="text-danger">{errors.subject || errors.body}</span>
          <span className="shrink-0 tabular-nums text-ink-muted">
            {(form.body.replace(/<[^>]+>/g, "").length).toLocaleString()} / {MAX_BODY_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );

  return (
    <form
      onSubmit={handleSubmit}
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
          >
            {errors.general}
          </p>
        )}

        <div>
          <span className={railLabelClasses}>Deliver in</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {DELIVERY_PRESETS.map((preset) => {
              const isActive = surpriseLabel === preset.label || 
                (preset.months && form.deliver_at === dateInMonths(preset.months!));
                
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (preset.randomRange) {
                      setSurpriseLabel(preset.label);
                      updateField("deliver_at", getRandomDateInMonths(preset.randomRange[0], preset.randomRange[1]));
                    } else {
                      setSurpriseLabel("");
                      updateField("deliver_at", dateInMonths(preset.months!));
                    }
                  }}
                  className={`rounded-[var(--radius-full)] border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
                    isActive
                      ? "border-accent bg-accent text-accent-on"
                      : "border-line text-ink-soft hover:border-accent hover:text-accent-text"
                  }`}
                >
                  {preset.label}
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
            onChange={(e) => {
              setSurpriseLabel("");
              updateField("deliver_at", e.target.value);
            }}
            min={getEarliestDate()}
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
            className={`${railFieldClasses} mt-2`}
          />
        </div>

        {/* Public Board Options */}
        <div className="rounded-[var(--radius-md)] border border-line p-4 bg-surface/50">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => updateField("is_public", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-line text-accent focus:ring-accent accent-accent"
            />
            <div>
              <div className="font-medium text-ink text-sm">Post to Public Board</div>
              <div className="text-xs text-ink-muted mt-0.5">Let others read your letter after it has been delivered.</div>
            </div>
          </label>
          
          {form.is_public && (
            <div className="mt-4 pl-7 animate-fade">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_anonymous}
                  onChange={(e) => updateField("is_anonymous", e.target.checked)}
                  className="h-4 w-4 rounded border-line text-accent focus:ring-accent accent-accent"
                />
                <span className="text-sm text-ink-soft">Post completely anonymously</span>
              </label>
              {!form.is_anonymous && (
                <p className="text-xs text-ink-muted mt-2">
                  Your letter will be signed as: <strong className="text-ink">{form.sender_name || "Past You"}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent px-6 py-3.5 text-base font-medium text-accent-on shadow-[var(--shadow-md)] transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
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
