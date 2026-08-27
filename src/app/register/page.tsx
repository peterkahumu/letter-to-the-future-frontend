"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api, ApiRequestError } from "@/lib/api";
import AuthCard from "@/components/AuthCard";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import Alert from "@/components/Alert";

const MIN_PASSWORD_LENGTH = 10;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function validate(): boolean {
    const found: Record<string, string> = {};
    if (!email.includes("@")) found.email = "Enter a valid email address.";
    if (password.length < MIN_PASSWORD_LENGTH) {
      found.password = `At least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirm !== password) found.confirm = "The two passwords don't match.";
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setBusy(true);
    try {
      await api.register(email, password, displayName.trim());
      setSent(true);
    } catch (err) {
      setErrors({
        general:
          err instanceof ApiRequestError
            ? err.message
            : "Couldn't create the account. Try again in a moment.",
      });
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle="One click and your account is ready."
        footer={
          <Link href="/login" className="text-accent-text hover:text-accent-hover">
            Back to sign in
          </Link>
        }
      >
        <Alert tone="success">
          If that address is free, a confirmation link is on its way to{" "}
          <strong>{email}</strong>. The link expires once you use it.
        </Alert>
        <p className="mt-4 text-xs text-ink-muted">
          Nothing arrived? Check your spam folder — and note that we answer the
          same way whether or not an account already exists, so nobody can use
          this page to find out who has one.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Keep your letters and journals in one place."
      footer={
        <>
          Already have one?{" "}
          <Link href="/login" className="text-accent-text hover:text-accent-hover">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.general && <Alert>{errors.general}</Alert>}

        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
          disabled={busy}
        />
        <FormField
          label="Display name"
          value={displayName}
          onChange={setDisplayName}
          hint="Optional — we'll use the first part of your email otherwise."
          autoComplete="name"
          required={false}
          disabled={busy}
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. Length beats punctuation — a short phrase works well.`}
          autoComplete="new-password"
          disabled={busy}
        />
        <FormField
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
          autoComplete="new-password"
          disabled={busy}
        />

        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>
    </AuthCard>
  );
}
