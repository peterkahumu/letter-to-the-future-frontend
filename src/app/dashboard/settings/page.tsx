"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Monitor } from "lucide-react";
import { api, ApiRequestError, type SessionInfo } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import Alert from "@/components/Alert";
import { formatDateTime } from "@/lib/format";

const MIN_PASSWORD_LENGTH = 10;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-md)] border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, refreshUser, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Settings</h1>
        <p className="mt-1.5 text-sm text-ink-soft">{user?.email}</p>
      </header>

      <ProfileSection onSaved={refreshUser} />
      {!user?.is_verified && <VerificationSection />}
      <PasswordSection />
      <SessionsSection />
      <DangerSection
        onDeleted={async () => {
          await signOut();
          router.push("/");
        }}
      />
    </div>
  );
}

/**
 * Seeded once at mount. RequireAuth wraps this whole page, so `user` is
 * already loaded by the time it renders — and syncing the field back from
 * context afterwards would overwrite whatever the user was typing.
 */
function ProfileSection({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await api.updateProfile(displayName.trim());
      await onSaved();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Profile">
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Saved.</Alert>}

        <FormField
          label="Display name"
          value={displayName}
          onChange={(value) => {
            setDisplayName(value);
            setSaved(false);
          }}
          disabled={busy}
        />
        <p className="text-xs text-ink-muted">
          Your email address is the account&apos;s identity and where letters
          are delivered, so it can&apos;t be changed here.
        </p>
        <SubmitButton busy={busy} className="w-auto px-6">
          Save
        </SubmitButton>
      </form>
    </Section>
  );
}

function VerificationSection() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function resend() {
    setBusy(true);
    try {
      const result = await api.resendVerification();
      setMessage(result.message);
    } catch {
      setMessage("Couldn't send it. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section
      title="Confirm your email"
      description="Your address hasn't been confirmed yet."
    >
      {message ? (
        <Alert tone="success">{message}</Alert>
      ) : (
        <SubmitButton
          type="button"
          onClick={() => void resend()}
          busy={busy}
          className="w-auto px-6"
        >
          Send a fresh link
        </SubmitButton>
      )}
    </Section>
  );
}

function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const found: Record<string, string> = {};
    if (next.length < MIN_PASSWORD_LENGTH) {
      found.next = `At least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirm !== next) found.confirm = "The two passwords don't match.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await api.changePassword(current, next);
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setErrors({
        general:
          err instanceof ApiRequestError ? err.message : "Couldn't change it.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section
      title="Password"
      description="Changing it signs every other device out."
    >
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4" noValidate>
        {errors.general && <Alert>{errors.general}</Alert>}
        {done && (
          <Alert tone="success">
            Password changed. Other devices have been signed out.
          </Alert>
        )}

        <FormField
          label="Current password"
          type="password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          disabled={busy}
        />
        <FormField
          label="New password"
          type="password"
          value={next}
          onChange={setNext}
          error={errors.next}
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

        <SubmitButton busy={busy} className="w-auto px-6">
          Change password
        </SubmitButton>
      </form>
    </Section>
  );
}

function SessionsSection() {
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [busy, setBusy] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    api
      .listSessions()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  async function endAll() {
    setBusy(true);
    try {
      await api.logoutEverywhere();
      // This device is included, so finish the job locally too.
      await signOut();
    } catch {
      setBusy(false);
    }
  }

  return (
    <Section
      title="Where you're signed in"
      description="Each browser you've signed in from keeps its own session."
    >
      {sessions === null ? (
        <div className="h-16 animate-pulse rounded-[var(--radius-sm)] bg-elevated" />
      ) : (
        <>
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-line bg-elevated px-4 py-3"
              >
                <Monitor
                  className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-soft">
                    {session.user_agent ?? "Unknown device"}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Started {formatDateTime(session.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => void endAll()}
            disabled={busy || sessions.length === 0}
            className="mt-4 flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-line-strong px-4 text-sm text-ink-soft transition-colors duration-200 hover:border-line-hover hover:text-ink disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out everywhere
          </button>
        </>
      )}
    </Section>
  );
}

function DangerSection({ onDeleted }: { onDeleted: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    try {
      await api.deleteAccount();
      await onDeleted();
    } catch {
      setError("Couldn't delete the account.");
      setBusy(false);
    }
  }

  return (
    <Section
      title="Delete your account"
      description="Your journals and entries go with it, permanently."
    >
      {error && <Alert>{error}</Alert>}

      <p className="mb-4 max-w-prose text-xs leading-relaxed text-ink-muted">
        Letters you&apos;ve already had confirmed will still be delivered.
        They&apos;re a promise to whoever is waiting for them, and closing your
        account shouldn&apos;t quietly cancel someone else&apos;s mail — cancel
        those individually first if that&apos;s what you want.
      </p>

      <button
        type="button"
        onClick={() => (confirming ? void remove() : setConfirming(true))}
        disabled={busy}
        className={`h-10 rounded-[var(--radius-sm)] border px-4 text-sm transition-colors duration-200 disabled:opacity-60 ${
          confirming
            ? "border-danger-line bg-danger-tint text-danger"
            : "border-line-strong text-ink-muted hover:border-danger-line hover:text-danger"
        }`}
      >
        {confirming ? "Yes, delete everything" : "Delete my account"}
      </button>
    </Section>
  );
}
