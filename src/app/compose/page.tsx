import type { Metadata } from "next";
import LetterForm from "@/components/LetterForm";

export const metadata: Metadata = {
  title: "Compose",
  description:
    "Write your letter to the future. Choose a delivery date and we'll send it to your inbox.",
};

export default function ComposePage() {
  return (
    <div className="px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in-up">
          <div className="text-4xl mb-3">📝</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Compose Your{" "}
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Letter
            </span>
          </h1>
          <p className="text-text-secondary">
            Take your time. Write from the heart.
          </p>
        </div>

        {/* Form card */}
        <div
          className="glass-strong rounded-[var(--radius-xl)] p-6 sm:p-8 animate-fade-in-up delay-200"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <LetterForm />
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-text-muted mt-6 animate-fade-in delay-400">
          🔒 Your letter is stored securely and only sent to the email you provide.
        </p>
      </div>
    </div>
  );
}
