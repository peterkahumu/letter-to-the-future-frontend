"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import AuthCard from "@/components/AuthCard";
import Alert from "@/components/Alert";

type State =
  | { kind: "working" }
  | { kind: "done" }
  | { kind: "error"; message: string };

function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { adoptSession } = useAuth();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>(
    // A missing token is knowable during render — no round trip needed to
    // decide it, and no effect needed to say so.
    token ? { kind: "working" } : { kind: "error", message: "That link is missing its token." }
  );
  // The token is one-time use, so React 19's development double-effect
  // would spend it on the first run and fail on the second.
  const spent = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (spent.current) return;
    spent.current = true;

    api
      .verifyEmail(token)
      .then((body) => {
        // Verifying proves they control the address, so sign them straight
        // in rather than bouncing them to a login form.
        adoptSession(
          { access: body.access_token, refresh: body.refresh_token },
          body.user
        );
        setState({ kind: "done" });
        setTimeout(() => router.push("/dashboard"), 1500);
      })
      .catch((err) =>
        setState({
          kind: "error",
          message:
            err instanceof ApiRequestError
              ? err.message
              : "Couldn't confirm that link.",
        })
      );
  }, [token, router, adoptSession]);

  if (state.kind === "working") {
    return (
      <AuthCard title="Confirming…" subtitle="One moment.">
        <div className="flex justify-center py-4">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent"
            role="status"
            aria-label="Confirming your address"
          />
        </div>
      </AuthCard>
    );
  }

  if (state.kind === "done") {
    return (
      <AuthCard title="You're all set" subtitle="Taking you to your dashboard…">
        <Alert tone="success">
          Your address is confirmed and you&apos;re signed in.
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="That link didn't work"
      footer={
        <Link href="/login" className="text-accent-text hover:text-accent-hover">
          Go to sign in
        </Link>
      }
    >
      <Alert>{state.message}</Alert>
      <p className="mt-4 text-sm text-ink-soft">
        Confirmation links can only be used once. If you&apos;ve already
        confirmed, just sign in. Otherwise sign in and ask for a fresh link
        from your settings.
      </p>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
