"use client";

import { api, type LetterStatusResponse } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ConfirmationPage() {
  const params = useParams<{ id: string }>();
  const [letter, setLetter] = useState<LetterStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    api
      .getLetterStatus(params.id)
      .then(setLetter)
      .catch(() => setError("Letter not found."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Loading your letter...</p>
        </div>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Letter Not Found</h1>
          <p className="text-text-secondary mb-6">
            We couldn't find this letter. It may have been removed.
          </p>
          <Link
            href="/compose"
            className="inline-flex items-center gap-2 rounded-full
                       bg-primary-600 px-6 py-3 text-sm font-semibold text-white
                       hover:bg-primary-500 transition-all duration-200 active:scale-95"
          >
            Write a New Letter
          </Link>
        </div>
      </div>
    );
  }

  const days = daysUntil(letter.deliver_at);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="mx-auto max-w-lg w-full text-center">
        {/* Success animation */}
        <div className="mb-8 animate-scale-in">
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto"
            viewBox="0 0 96 96"
            fill="none"
          >
            {/* Outer ring */}
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="var(--primary-500)"
              strokeWidth="3"
              strokeOpacity="0.2"
            />
            {/* Animated ring */}
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="var(--primary-500)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="276"
              strokeDashoffset="276"
              style={{
                animation: "check-draw 1s var(--ease-out) 0.2s forwards",
              }}
            />
            {/* Check mark */}
            <path
              d="M30 50 L42 62 L66 38"
              stroke="var(--primary-400)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-check"
            />
          </svg>
        </div>

        {/* Card */}
        <div
          className="glass-strong rounded-[var(--radius-xl)] p-6 sm:p-8 animate-fade-in-up delay-200"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Letter{" "}
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Sent!
            </span>
          </h1>

          <p className="text-text-secondary mb-6">
            Your letter is safely stored and will be delivered on time.
          </p>

          {/* Details */}
          <div className="space-y-3 text-left mb-8">
            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
              <span className="text-lg">📧</span>
              <div>
                <p className="text-xs text-text-muted">Delivering to</p>
                <p className="text-sm font-medium">{letter.recipient_email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-xs text-text-muted">Delivery date</p>
                <p className="text-sm font-medium">
                  {formatDate(letter.deliver_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
              <span className="text-lg">⏳</span>
              <div>
                <p className="text-xs text-text-muted">Countdown</p>
                <p className="text-sm font-medium">
                  {days === 0
                    ? "Arriving today!"
                    : days === 1
                    ? "1 day to go"
                    : `${days} days to go`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
              <span className="text-lg">📝</span>
              <div>
                <p className="text-xs text-text-muted">Subject</p>
                <p className="text-sm font-medium">{letter.subject}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <Link
            href="/compose"
            className="inline-flex items-center gap-2 rounded-full
                       bg-primary-600 px-6 py-3 text-sm font-semibold text-white
                       shadow-lg shadow-primary-600/25
                       transition-all duration-200
                       hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30
                       active:scale-95 focus-ring"
            id="write-another-cta"
          >
            Write Another Letter ✨
          </Link>
        </div>

        {/* Home link */}
        <Link
          href="/"
          className="inline-block mt-6 text-sm text-text-muted hover:text-primary-500 transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
