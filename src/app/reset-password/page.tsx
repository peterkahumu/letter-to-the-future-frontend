"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { api, ApiRequestError } from "@/lib/api";
import AuthCard from "@/components/AuthCard";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import Alert from "@/components/Alert";

const MIN_PASSWORD_LENGTH = 10;

function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const found: Record<string, string> = {};
    if (password.length < MIN_PASSWORD_LENGTH) {
      found.password = `At least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirm !== password) found.confirm = "The two passwords don't match.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setErrors({
        general:
          err instanceof ApiRequestError
            ? err.message
            : "Couldn't reset the password.",
      });
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthCard title="That link is incomplete">
        <Alert>This reset link is missing its token.</Alert>
        <p className="mt-4 text-sm text-ink-soft">
          Ask for a{" "}
          <Link
            href="/forgot-password"
            className="text-accent-text hover:text-accent-hover"
          >
            fresh link
          </Link>
          .
        </p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password changed" subtitle="Taking you to sign in…">
        <Alert tone="success">
          Every device has been signed out — sign in again with your new
          password.
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.general && <Alert>{errors.general}</Alert>}

        <FormField
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          autoComplete="new-password"
          disabled={busy}
        />
        <FormField
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
          autoComplete="new-password"
          disabled={busy}
        />

        <SubmitButton busy={busy}>Set new password</SubmitButton>
      </form>

      <p className="mt-5 text-xs text-ink-muted">
        Resetting signs you out everywhere, on purpose — if someone else had
        your password, their session ends here too.
      </p>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
