"use client";

export const runtime = 'edge';

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  api,
  ApiRequestError,
  type LetterStatus,
  type LetterStatusResponse,
} from "@/lib/api";
import Modal from "@/components/Modal";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  InboxIcon,
  PenIcon,
} from "@/components/icons";

// A letter is only worth cancelling while it can still be stopped.
const CANCELLABLE: LetterStatus[] = ["pending", "scheduled"];

const STATUS_COPY: Record<
  LetterStatus,
  { eyebrow: string; heading: string; blurb: string }
> = {
  pending: {
    eyebrow: "Awaiting confirmation",
    heading: "Check your inbox.",
    blurb:
      "We've emailed a confirmation link. The letter is scheduled the moment you click it — until then, nothing is sent.",
  },
  scheduled: {
    eyebrow: "Sealed",
    heading: "Your letter is on its way.",
    blurb:
      "It's stored safely and will be delivered on the date you chose. You can close this page — nothing else is needed.",
  },
  sent: {
    eyebrow: "Delivered",
    heading: "Your letter has arrived.",
    blurb: "It was delivered to the inbox you chose. Time to read it.",
  },
  failed: {
    eyebrow: "Undelivered",
    heading: "We couldn't deliver this letter.",
    blurb:
      "We tried several times and the address wouldn't accept it. Write it again to a different address.",
  },
  cancelled: {
    eyebrow: "Cancelled",
    heading: "This letter won't be sent.",
    blurb: "It's been withdrawn and will never be delivered.",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysUntil(iso: string): number {
  const target = new Date(iso);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

function countdownLabel(days: number): string {
  if (days === 0) return "Arriving today";
  if (days === 1) return "1 day to go";
  return `${days} days to go`;
}

export default function ConfirmationPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  // Present only when arriving from the emailed manage link. It is what
  // authorises cancelling — there are no accounts.
  const manageToken = search.get("token");

  const [letter, setLetter] = useState<LetterStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    api
      .getLetterStatus(params.id, manageToken ?? undefined)
      .then(setLetter)
      .catch(() => setError("Letter not found."))
      .finally(() => setLoading(false));
  }, [params.id, manageToken]);

  const handleCancel = async () => {
    if (!params.id || !manageToken) return;

    setCancelling(true);
    setCancelError(null);
    try {
      await api.cancelLetter(params.id, manageToken);
      const fresh = await api.getLetterStatus(params.id, manageToken);
      setLetter(fresh);
      setConfirmingCancel(false);
    } catch (err) {
      setCancelError(
        err instanceof ApiRequestError
          ? err.message
          : "Couldn't cancel the letter. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <p className="animate-fade text-ink-muted">Loading your letter…</p>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
          We couldn’t find that letter.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          The link may be incorrect, or the letter may have been removed.
        </p>
        <Link
          href="/compose"
          className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-6 text-base font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
        >
          Write a new letter
          <ArrowRightIcon className="h-[18px] w-[18px]" />
        </Link>
      </div>
    );
  }

  const days = daysUntil(letter.deliver_at);

  const details = [
    { Icon: InboxIcon, label: "Delivering to", value: letter.recipient_email_masked },
    {
      Icon: CalendarIcon,
      label: "Delivery date",
      value: formatDate(letter.deliver_at),
    },
    { Icon: ClockIcon, label: "Countdown", value: countdownLabel(days) },
    { Icon: PenIcon, label: "Subject", value: letter.subject },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="animate-rise flex items-start gap-5">
        <SealMark />
        <div>
          <p className="eyebrow">{STATUS_COPY[letter.status].eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
            {STATUS_COPY[letter.status].heading}
          </h1>
        </div>
      </header>

      <p className="animate-rise delay-100 mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
        {STATUS_COPY[letter.status].blurb}
      </p>

      <dl className="animate-rise delay-200 mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-elevated shadow-[var(--shadow-md)]">
        {details.map(({ Icon, label, value }, i) => (
          <div
            key={label}
            className={`flex items-start gap-4 px-5 py-5 sm:px-7 ${
              i > 0 ? "border-t border-line" : ""
            }`}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" />
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                {label}
              </dt>
              <dd className="mt-1.5 break-words text-base text-ink">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {manageToken && CANCELLABLE.includes(letter.status) && (
        <div className="animate-fade delay-300 mt-8">
          <button
            type="button"
            onClick={() => setConfirmingCancel(true)}
            disabled={cancelling}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-line px-5 text-sm font-medium text-ink transition-colors duration-200 hover:border-danger hover:text-danger disabled:opacity-60"
          >
            {cancelling ? "Cancelling…" : "Cancel this letter"}
          </button>
        </div>
      )}

      <Modal
        open={confirmingCancel}
        onClose={() => setConfirmingCancel(false)}
        title="Cancel this letter?"
        description="It won't be delivered, and this can't be undone. The letter itself stays readable here."
      >
        {cancelError && (
          <p role="alert" className="mb-3 text-sm text-danger">
            {cancelError}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setConfirmingCancel(false)}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-line px-5 text-base font-medium text-ink transition-colors duration-200 hover:border-line-strong"
          >
            Keep it scheduled
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-danger px-5 text-base font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Cancel the letter"}
          </button>
        </div>
      </Modal>

      <div className="animate-fade delay-300 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/compose"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent px-6 text-base font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
          id="write-another-cta"
        >
          Write another letter
          <ArrowRightIcon className="h-[18px] w-[18px]" />
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong px-6 text-base font-medium text-ink transition-colors duration-200 hover:border-accent hover:text-accent-text"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

/** Wax-seal style confirmation mark that draws itself once on mount. */
function SealMark() {
  return (
    <svg
      className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="29"
        stroke="var(--line-strong)"
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="32"
        r="29"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={300}
        className="animate-seal"
        transform="rotate(-90 32 32)"
      />
      <path
        d="M21 33.5 28.5 41 44 24"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={300}
        className="animate-seal"
      />
    </svg>
  );
}
