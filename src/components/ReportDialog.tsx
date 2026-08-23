"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { api, ApiRequestError } from "@/lib/api";

export type ReportReason =
  | "spam"
  | "harassment"
  | "sexual"
  | "violence"
  | "personal_info"
  | "other";

const REASONS: { value: ReportReason; label: string; hint: string }[] = [
  { value: "spam", label: "Spam or advertising", hint: "Promotional or repetitive content" },
  { value: "harassment", label: "Harassment or hate", hint: "Attacks a person or group" },
  { value: "sexual", label: "Sexual content", hint: "Explicit material" },
  { value: "violence", label: "Violence or self-harm", hint: "Threatens or encourages harm" },
  { value: "personal_info", label: "Someone's private information", hint: "An address, phone number, or similar" },
  { value: "other", label: "Something else", hint: "Tell us below" },
];

interface Props {
  letterId: string | null;
  onClose: () => void;
  onReported: (letterId: string) => void;
}

export default function ReportDialog({ letterId, onClose, onReported }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const close = () => {
    setReason(null);
    setDetails("");
    setError(null);
    setDone(false);
    setSubmitting(false);
    onClose();
  };

  const submit = async () => {
    if (!letterId || !reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.reportLetter(letterId, reason, details);
      onReported(letterId);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "We couldn't send that report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={letterId !== null}
      onClose={close}
      title={done ? "Report received" : "Report this letter"}
      description={
        done
          ? undefined
          : "Tell us what's wrong and a moderator will review it. Reports are anonymous."
      }
    >
      {done ? (
        <>
          <p className="text-sm leading-relaxed text-ink-soft">
            Thanks. A moderator will review this letter. If several people report
            it, it’s hidden from the board straight away.
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-sm)] bg-accent px-5 text-base font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
          >
            Done
          </button>
        </>
      ) : (
        <>
          <fieldset>
            <legend className="sr-only">Reason for reporting</legend>
            <div className="flex flex-col gap-1.5">
              {REASONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border px-3.5 py-2.5 transition-colors duration-200 ${
                    reason === option.value
                      ? "border-accent bg-accent/5"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">
                      {option.label}
                    </span>
                    <span className="block text-xs text-ink-muted">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label
            htmlFor="report-details"
            className="mt-5 block text-sm font-medium text-ink"
          >
            Anything else? <span className="text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="report-details"
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
            rows={3}
            placeholder="Add any detail that would help a moderator."
            className="mt-2 w-full resize-y rounded-[var(--radius-sm)] border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors duration-200 hover:border-line-strong focus:border-accent focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-ink-muted tabular-nums">
            {details.length}/1000
          </p>

          {error && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-line px-5 text-base font-medium text-ink transition-colors duration-200 hover:border-line-strong"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!reason || submitting}
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-accent px-5 text-base font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Submit report"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
