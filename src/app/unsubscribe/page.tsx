"use client";

export const runtime = 'edge';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";

type State =
  | { kind: "working" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

/**
 * Honours the unsubscribe link in every delivered letter. Suppresses the
 * address and cancels anything still queued for it.
 */
export default function UnsubscribePage() {
  const search = useSearchParams();
  const email = search.get("email");
  const token = search.get("t");
  const [state, setState] = useState<State>(
    // Same reasoning as the confirm page: an incomplete link needs no round
    // trip to diagnose, so it is decided during render.
    email && token
      ? { kind: "working" }
      : { kind: "error", message: "This unsubscribe link is incomplete." }
  );

  useEffect(() => {
    if (!email || !token) return;

    api
      .unsubscribe(email, token)
      .then((res) => setState({ kind: "done", message: res.message }))
      .catch((err) =>
        setState({
          kind: "error",
          message:
            err instanceof ApiRequestError
              ? err.message
              : "We couldn't process this unsubscribe link.",
        })
      );
  }, [email, token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-5 py-16 sm:px-8">
      {state.kind === "working" && (
        <p className="animate-fade text-ink-muted">Updating your preferences…</p>
      )}

      {state.kind === "done" && (
        <>
          <p className="eyebrow">Unsubscribed</p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
            You’re off the list.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            {state.message} Any letters still waiting for this address have been
            cancelled.
          </p>
        </>
      )}

      {state.kind === "error" && (
        <>
          <p className="eyebrow">Couldn’t unsubscribe</p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
            This link didn’t work.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{state.message}</p>
        </>
      )}

      <Link href="/" className="mt-8 text-base text-accent-text underline underline-offset-2">
        Back to Letter to the Future
      </Link>
    </div>
  );
}
