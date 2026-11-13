"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import AuthCard from "@/components/AuthCard";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import Alert from "@/components/Alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.forgotPassword(email);
    } catch {
      // Deliberately swallowed. The server answers the same for a known and
      // an unknown address; showing an error here would undo that and turn
      // this page into a way to test whether someone has an account.
    }
    setSent(true);
    setBusy(false);
  }

  return (
    <AuthCard
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent ? undefined : "We'll email you a link to choose a new one."
      }
      footer={
        <Link href="/login" className="text-accent-text hover:text-accent-hover">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <Alert tone="success">
          If an account exists for <strong>{email}</strong>, a reset link is on
          its way. It expires in an hour and works once.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={busy}
          />
          <SubmitButton busy={busy}>Send reset link</SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}
