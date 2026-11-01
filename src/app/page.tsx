import Link from "next/link";
import LetterCard from "@/components/LetterCard";
import PointerGlow from "@/components/PointerGlow";
import Reveal from "@/components/Reveal";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  EnvelopeIcon,
  InboxIcon,
  LockIcon,
  PenIcon,
} from "@/components/icons";
import { NotebookPen } from "lucide-react";

const steps = [
  {
    Icon: PenIcon,
    title: "Write it",
    description:
      "Set down what today actually feels like — the goals, the worries, the promises. Add a photo, a voice note or a video if words aren't enough.",
  },
  {
    Icon: EnvelopeIcon,
    title: "Confirm the address",
    description:
      "We email the address you chose and wait. Nothing is scheduled until that link is opened, so a letter can never arrive uninvited.",
  },
  {
    Icon: ClockIcon,
    title: "It waits, sealed",
    description:
      "Months or years, however far out you picked. You keep a private link to check on it — or call it back — any time before it goes.",
  },
  {
    Icon: InboxIcon,
    title: "It arrives",
    description:
      "On the morning you chose, word for word, exactly as you left it. Afterwards you can share it to the Public Board, or keep it to yourself.",
  },
];

const reassurances = [
  {
    Icon: CalendarIcon,
    title: "Cancel until the day it sends",
    body: "The link we email you cancels the letter outright, no account needed.",
  },
  {
    Icon: LockIcon,
    title: "Your address stays yours",
    body: "Only used to deliver this letter. Never shown on the board, never sold.",
  },
  {
    Icon: EnvelopeIcon,
    title: "Sharing is optional, and later",
    body: "A letter only reaches the Public Board if you asked it to — and never before it's been delivered.",
  },
  {
    Icon: NotebookPen,
    title: "Private journals for members",
    body: "Want to write daily reflections? Registered members get private, dated notebooks to revisit and rewrite anytime.",
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

            <p className="animate-rise delay-400 mt-6 text-sm text-ink-muted">
              Free, no account. The recipient confirms before anything is
              scheduled.
            </p>
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
          <Reveal className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
              Four steps, then time does the rest.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              The second step is the one people don’t expect, and it’s the one
              that matters most.
            </p>
          </Reveal>

          <ol className="mt-14 grid gap-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            {steps.map(({ Icon, title, description }, i) => (
              <Reveal key={title} as="li" delay={(i * 100) as 0 | 100 | 200 | 300}>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-full)] border border-line-strong bg-elevated text-accent-text">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl text-line-strong">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-soft">
                  {description}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* What you keep control of */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {reassurances.map(({ Icon, title, body }, i) => (
            <Reveal
              key={title}
              delay={(Math.min(i * 100, 300)) as 0 | 100 | 200 | 300}
              className="bg-paper p-7"
            >
              <Icon className="h-5 w-5 text-accent-text" />
              <h3 className="mt-4 text-base font-medium text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
        <Reveal className="panel relative rounded-[var(--radius-lg)] px-7 py-14 text-center text-panel-ink sm:px-14 sm:py-20">
          <Reveal
            as="span"
            effect="animate-stamp"
            aria-hidden="true"
            className="absolute right-6 top-6 hidden h-20 w-20 rotate-[-6deg] items-center justify-center rounded-[var(--radius-sm)] border-2 border-dashed border-stamp-soft text-center font-display text-[0.65rem] uppercase leading-tight tracking-widest text-stamp sm:flex"
          >
            Post
            <br />
            marked
            <br />
            today
          </Reveal>

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
        </Reveal>
      </section>
    </>
  );
}
