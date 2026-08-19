import Link from "next/link";
import LetterCard from "@/components/LetterCard";
import PointerGlow from "@/components/PointerGlow";
import {
  ArrowRightIcon,
  CalendarIcon,
  InboxIcon,
  LockIcon,
  PenIcon,
} from "@/components/icons";

const steps = [
  {
    Icon: PenIcon,
    title: "Write your letter",
    description:
      "Set down the thoughts, goals and promises that matter to you right now — as long or as short as you like.",
  },
  {
    Icon: CalendarIcon,
    title: "Choose the date",
    description:
      "Next month, next year, or a decade from now. Your letter waits, sealed, until the day arrives.",
  },
  {
    Icon: InboxIcon,
    title: "Receive it",
    description:
      "On the morning you picked, it lands in your inbox exactly as you wrote it. Nothing added, nothing lost.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero: copy and letter graphic sit side by side from lg up */}
      <section className="relative overflow-hidden">
        <PointerGlow />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-24">
          <div>
            <p className="eyebrow animate-rise">A time capsule for your inbox</p>

            <h1 className="animate-rise delay-100 mt-5 font-display text-[2.5rem] leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
              Write a letter to{" "}
              <span className="text-accent-display">your future self</span>.
            </h1>

            <p className="animate-rise delay-200 mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Capture who you are today. We hold onto it and deliver it, word
              for word, on the date you choose.
            </p>

            <div className="animate-rise delay-300 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/compose"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent px-7 text-base font-medium text-accent-on shadow-[var(--shadow-md)] transition-colors duration-200 hover:bg-accent-hover"
                id="hero-cta"
              >
                Start writing
                <ArrowRightIcon className="h-[18px] w-[18px]" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong px-7 text-base font-medium text-ink transition-colors duration-200 hover:border-accent hover:text-accent-text"
                id="how-it-works-link"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="animate-rise delay-400">
            <LetterCard />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-16 border-y border-line bg-surface"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
              Three steps, then time does the rest.
            </h2>
          </div>

          <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-3">
            {steps.map(({ Icon, title, description }, i) => (
              <li
                key={title}
                className="group bg-paper p-7 transition-colors duration-300 hover:bg-elevated sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-accent-text" />
                  <span className="font-display text-2xl text-line-strong transition-colors duration-300 group-hover:text-accent-display">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl text-ink">{title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="panel rounded-[var(--radius-lg)] px-7 py-14 text-center text-panel-ink sm:px-14 sm:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight sm:text-[2.75rem]">
            Your future self is waiting to hear from you.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-panel-ink-soft">
            It takes a few minutes today and means a great deal later. Free, for
            as long as it takes.
          </p>
          <Link
            href="/compose"
            className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-panel-btn px-7 text-base font-medium text-panel-btn-ink transition-opacity duration-200 hover:opacity-90"
            id="final-cta"
          >
            Write your letter
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </Link>

          <p className="mx-auto mt-12 flex max-w-md items-center justify-center gap-2.5 border-t border-panel-line pt-6 text-sm text-panel-ink-soft">
            <LockIcon className="h-4 w-4 shrink-0" />
            Stored privately and sent only to the address you give us.
          </p>
        </div>
      </section>
    </>
  );
}
