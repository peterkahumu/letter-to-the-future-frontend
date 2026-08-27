"use client";

import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import {
  api,
  ApiRequestError,
  MOODS,
  type JournalEntry,
  type Mood,
} from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";
import SubmitButton from "@/components/SubmitButton";
import Alert from "@/components/Alert";

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function currentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Write a new entry or edit an existing one.
 *
 * The same component does both, because editing is not a special mode here —
 * an entry is meant to be changed, so the form for changing it is the form
 * for writing it.
 *
 * State is seeded from props once, on mount. Callers switching between
 * entries pass a `key` so React remounts this instead — resetting a form by
 * remounting it is both simpler and less error-prone than an effect that
 * writes over whatever the user has already typed.
 */
export default function EntryEditor({
  journalId,
  entry,
  onSaved,
  onCancel,
  onDeleted,
}: {
  journalId: string;
  entry?: JournalEntry | null;
  onSaved: (entry: JournalEntry) => void;
  onCancel: () => void;
  onDeleted?: (id: string) => void;
}) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [entryDate, setEntryDate] = useState(entry?.entry_date ?? today());
  const [entryTime, setEntryTime] = useState(entry?.entry_time ?? "");
  const [mood, setMood] = useState<Mood | "">(entry?.mood ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEmpty = body.replace(/<[^>]*>/g, "").trim().length === 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isEmpty) {
      setError("Write something first.");
      return;
    }

    setError("");
    setBusy(true);
    try {
      const saved = entry
        ? await api.updateEntry(entry.id, {
            title,
            body,
            entry_date: entryDate,
            entry_time: entryTime || null,
            mood: mood || null,
          })
        : await api.createEntry(journalId, {
            title,
            body,
            entry_date: entryDate,
            entry_time: entryTime || null,
            mood: mood || null,
          });
      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Couldn't save that."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    setBusy(true);
    try {
      await api.deleteEntry(entry.id);
      onDeleted?.(entry.id);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Couldn't delete that."
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}

      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title (optional)"
        maxLength={300}
        disabled={busy}
        aria-label="Entry title"
        className="w-full border-b border-line-strong bg-transparent pb-2 font-display text-2xl text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
      />

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <label htmlFor="entry-date" className="block text-xs text-ink-muted">
            Date
          </label>
          <input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
            disabled={busy}
            className="rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="entry-time" className="block text-xs text-ink-muted">
            Time
          </label>
          <div className="flex gap-1.5">
            <input
              id="entry-time"
              type="time"
              value={entryTime}
              onChange={(event) => setEntryTime(event.target.value)}
              disabled={busy}
              className="rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
            />
            {!entryTime && (
              <button
                type="button"
                onClick={() => setEntryTime(currentTime())}
                disabled={busy}
                className="rounded-[var(--radius-sm)] border border-line-strong px-2 py-2 text-xs text-ink-muted transition-colors hover:border-line-hover hover:text-ink-soft"
                title="Set to now"
              >
                Now
              </button>
            )}
            {entryTime && (
              <button
                type="button"
                onClick={() => setEntryTime("")}
                disabled={busy}
                className="rounded-[var(--radius-sm)] border border-line-strong px-2 py-2 text-xs text-ink-muted transition-colors hover:border-line-hover hover:text-ink-soft"
                title="Clear time"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="entry-mood" className="block text-xs text-ink-muted">
            Mood
          </label>
          <select
            id="entry-mood"
            value={mood}
            onChange={(event) => setMood(event.target.value as Mood | "")}
            disabled={busy}
            className="rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="">—</option>
            {MOODS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <RichTextEditor
        content={body}
        onChange={setBody}
        placeholder="How was it?"
      />

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {entry && onDeleted && (
          <button
            type="button"
            onClick={() =>
              confirmingDelete ? void handleDelete() : setConfirmingDelete(true)
            }
            disabled={busy}
            className={`flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border px-4 text-sm transition-colors duration-200 disabled:opacity-60 ${
              confirmingDelete
                ? "border-danger-line bg-danger-tint text-danger"
                : "border-line-strong text-ink-muted hover:border-danger-line hover:text-danger"
            }`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {confirmingDelete ? "Really delete?" : "Delete"}
          </button>
        )}

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-11 rounded-[var(--radius-sm)] border border-line-strong px-4 text-sm text-ink-soft transition-colors duration-200 hover:border-line-hover hover:text-ink"
          >
            Cancel
          </button>
          <SubmitButton busy={busy} disabled={isEmpty} className="w-auto px-6">
            {entry ? "Save changes" : "Add entry"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
