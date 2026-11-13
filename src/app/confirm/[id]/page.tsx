"use client";

export const runtime = 'edge';

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiRequestError, type LetterStatusResponse } from "@/lib/api";
import { ArrowRightIcon } from "@/components/icons";

type State =
  | { kind: "working" }
  | { kind: "done"; letter: LetterStatusResponse }
  | { kind: "error"; message: string };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Lands here from the confirmation email. Exchanging the token is what
 * actually schedules the letter — until this runs, nothing is queued.
 */
export default function ConfirmPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const token = search.get("token");
  const [state, setState] = useState<State>(
    // A link with no token is broken before any request is made, so decide
    // it during render rather than setting state from inside an effect.
    token
      ? { kind: "working" }
      : { kind: "error", message: "This link is missing its confirmation code." }
  );

  useEffect(() => {
    if (!params.id || !token) return;

    api
      .confirmLetter(params.id, token)
      .then((letter) => setState({ kind: "done", letter }))
      .catch((err) =>
        setState({
          kind: "error",
          message:
            err instanceof ApiRequestError
              ? err.message
              : "We couldn't confirm this letter.",
        })
      );
  }, [params.id, token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-5 py-16 sm:px-8">
      {state.kind === "working" && (
        <p className="animate-fade text-ink-muted">Confirming your letter…</p>
      )}

      {state.kind === "error" && (
        <>
          <p className="eyebrow">Couldn’t confirm</p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
            This link didn’t work.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            {state.message} Confirmation links can only be used once — if you’ve
            already confirmed, your letter is safely scheduled.
          </p>
          <Link
            href="/compose"
            className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-6 text-base font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
          >
            Write a new letter
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </Link>
        </>
      )}

      {state.kind === "done" && (
        <>
          <p className="eyebrow">Confirmed</p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
            Your letter is scheduled.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            It will arrive on {formatDate(state.letter.deliver_at)}. Nothing else
            is needed — you can close this page.
          </p>
          <Link
            href={`/confirmation/${state.letter.id}`}
            className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-6 text-base font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
          >
            See the details
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </Link>
        </>
      )}
    </div>
  );
}
