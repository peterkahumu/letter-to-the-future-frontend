"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { NotebookPen } from "lucide-react";
import { ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import AuthCard from "@/components/AuthCard";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import Alert from "@/components/Alert";

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const user = await signIn(email, password);
      // Only ever follow a same-site path. An absolute URL here would turn
      // the login page into an open redirect.
      const next = searchParams.get("next");
      const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : null;
      router.push(safeNext ?? (user.role === "admin" ? "/admin" : "/dashboard"));
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Couldn't sign in. Check your connection and try again."
      );
      setBusy(false);
    }
  }

  const next = searchParams.get("next");
  const isJournals = next?.includes("journals");

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your letters and journals."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="text-accent-text hover:text-accent-hover">
            Create an account
          </Link>
        </>
      }
    >
      {isJournals && (
        <div className="mb-4 flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-line-strong bg-tint/60 p-3 text-xs text-ink-soft">
          <NotebookPen className="h-4 w-4 shrink-0 text-accent-text mt-0.5" aria-hidden="true" />
          <div>
            <strong className="text-ink font-medium">Private Journal Entries:</strong>{" "}
            Sign in to access your personal notebooks and daily entries. Don&apos;t have an account yet? Create one below.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert>{error}</Alert>}

        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="you@example.com"
          disabled={busy}
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          disabled={busy}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-ink-muted hover:text-ink-soft"
          >
            Forgot your password?
          </Link>
        </div>

        <SubmitButton busy={busy}>Sign in</SubmitButton>
      </form>

      <p className="mt-6 border-t border-line pt-5 text-center text-xs text-ink-muted">
        You don&apos;t need an account to write a letter —{" "}
        <Link href="/compose" className="text-accent-text hover:text-accent-hover">
          write one now
        </Link>
        .
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
