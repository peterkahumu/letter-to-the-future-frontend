import type { Metadata } from "next";
import LetterForm from "@/components/LetterForm";
import { EnvelopeIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Compose",
  description:
    "Write your letter to the future. Choose a delivery date and we'll send it to your inbox.",
};

export default function ComposePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="animate-rise mb-9 max-w-2xl">
        <p className="eyebrow">Compose</p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-5xl">
          A letter for later.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Write it, pick when it lands, send it. Nobody reads this but the
          person you’ll be on the day it arrives.
        </p>
        <p className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line bg-surface/60 px-4 py-3 text-sm leading-relaxed text-ink-soft">
          <EnvelopeIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
          <span>
            One thing to know: we email the recipient to confirm before
            anything is scheduled. Until they open that link, the letter sits
            unsent — and you can cancel it at any point before the delivery
            date.
          </span>
        </p>
      </header>

      <div className="animate-rise delay-200">
        <LetterForm />
      </div>
    </div>
  );
}
