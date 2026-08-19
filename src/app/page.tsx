import Link from "next/link";

const steps = [
  {
    icon: "✍️",
    title: "Write Your Letter",
    description:
      "Pour your thoughts, goals, and dreams into a letter to your future self.",
  },
  {
    icon: "📅",
    title: "Pick a Date",
    description:
      "Choose when you want to receive it — next month, next year, or even further.",
  },
  {
    icon: "📬",
    title: "Receive It",
    description:
      "We'll deliver your letter to your inbox on the exact date you choose.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32 lg:py-40 text-center">
        {/* Floating envelope */}
        <div className="animate-envelope text-6xl sm:text-7xl lg:text-8xl mb-8 animate-fade-in">
          ✉️
        </div>

        {/* Tagline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl animate-fade-in-up">
          Write a letter to{" "}
          <span className="bg-gradient-to-r from-primary-300 via-primary-500 to-primary-700 bg-clip-text text-transparent">
            your future self
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-xl animate-fade-in-up delay-200">
          Capture today's thoughts, dreams, and promises. We'll deliver them
          to your inbox on the date you choose.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
          <Link
            href="/compose"
            className="inline-flex items-center justify-center gap-2 rounded-full
                       bg-primary-600 px-8 py-3.5 text-base font-semibold text-white
                       shadow-lg shadow-primary-600/25
                       transition-all duration-200
                       hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30
                       active:scale-95 focus-ring"
            id="hero-cta"
          >
            Start Writing
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-full
                       border border-[var(--border-default)] px-8 py-3.5
                       text-base font-semibold text-text-secondary
                       transition-all duration-200
                       hover:border-primary-500/40 hover:text-primary-500 hover:bg-primary-500/5
                       active:scale-95 focus-ring"
            id="how-it-works-link"
          >
            How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-8 animate-fade-in-up delay-400">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary-500">
              ∞
            </div>
            <div className="text-sm text-text-muted mt-1">
              Letters possible
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary-500">
              Free
            </div>
            <div className="text-sm text-text-muted mt-1">Forever</div>
          </div>
          <div className="text-center hidden sm:block">
            <div className="text-2xl sm:text-3xl font-bold text-primary-500">
              🔒
            </div>
            <div className="text-sm text-text-muted mt-1">Private</div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="relative px-4 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl sm:text-4xl font-bold mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-center text-text-secondary max-w-lg mx-auto mb-16">
            Three simple steps to send a message across time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="group relative rounded-[var(--radius-xl)] p-6 sm:p-8
                           glass transition-all duration-300
                           hover:shadow-glow hover:-translate-y-1"
              >
                {/* Step number */}
                <div
                  className="absolute -top-3 -left-2 w-7 h-7 rounded-full
                             bg-primary-600 text-white text-xs font-bold
                             flex items-center justify-center shadow-md"
                >
                  {i + 1}
                </div>

                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="relative px-4 py-20 sm:py-24 text-center">
        <div className="mx-auto max-w-2xl glass-strong rounded-[var(--radius-xl)] p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to write?
          </h2>
          <p className="text-text-secondary mb-8">
            Your future self will thank you for taking a moment to reflect.
          </p>
          <Link
            href="/compose"
            className="inline-flex items-center gap-2 rounded-full
                       bg-primary-600 px-8 py-3.5 text-base font-semibold text-white
                       shadow-lg shadow-primary-600/25
                       transition-all duration-200
                       hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30
                       active:scale-95 focus-ring"
            id="final-cta"
          >
            Write Your Letter ✨
          </Link>
        </div>
      </section>
    </div>
  );
}
