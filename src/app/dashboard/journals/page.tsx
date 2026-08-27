"use client";

import { useEffect, useState, type FormEvent } from "react";
import { NotebookPen, Plus } from "lucide-react";
import {
  api,
  ApiRequestError,
  JOURNAL_COLORS,
  type Journal,
  type JournalColor,
} from "@/lib/api";
import JournalCard from "@/components/JournalCard";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import Alert from "@/components/Alert";

const SWATCH: Record<JournalColor, string> = {
  turquoise: "bg-[var(--turquoise-400)]",
  gold: "bg-[var(--stamp)]",
  rose: "bg-[#f0929a]",
  violet: "bg-[#b49bf0]",
  amber: "bg-[#f0b45a]",
  slate: "bg-[#8ba3a0]",
};

export default function JournalsPage() {
  const [showArchived, setShowArchived] = useState(false);
  // Held together with the toggle it was fetched for, so a result arriving
  // after the toggle flipped is recognisably stale.
  const [loaded, setLoaded] = useState<{
    archived: boolean;
    rows: Journal[];
  } | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const journals = loaded?.archived === showArchived ? loaded.rows : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<JournalColor>("turquoise");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stale = false;

    api
      .getJournals(showArchived)
      .then((rows) => {
        if (!stale) setLoaded({ archived: showArchived, rows });
      })
      .catch(() => {
        if (!stale) setError("Couldn't load your journals.");
      });

    return () => {
      stale = true;
    };
  }, [showArchived]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setBusy(true);

    try {
      const journal = await api.createJournal({
        title,
        description: description.trim() || null,
        color,
      });
      setLoaded((current) =>
        current ? { ...current, rows: [journal, ...current.rows] } : current
      );
      setCreating(false);
      setTitle("");
      setDescription("");
      setColor("turquoise");
    } catch (err) {
      setFormError(
        err instanceof ApiRequestError ? err.message : "Couldn't create it."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Journals</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Notebooks you can edit, revisit, and rewrite — the opposite of a
            letter.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-10 items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New journal
        </button>
      </header>

      {error && <Alert>{error}</Alert>}

      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-ink-muted">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(event) => setShowArchived(event.target.checked)}
          className="h-3.5 w-3.5 accent-[var(--accent)]"
        />
        Show archived
      </label>

      {journals === null ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface"
            />
          ))}
        </div>
      ) : journals.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface/50 p-12 text-center">
          <NotebookPen className="mx-auto h-6 w-6 text-ink-muted" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink">No journals yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs text-ink-muted">
            A journal holds dated entries. Keep one, or keep several — one per
            part of your life.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-4 inline-flex h-9 items-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
          >
            Start your first
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {journals.map((journal) => (
            <JournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New journal"
        description="Give it a name. You can change everything later."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <Alert>{formError}</Alert>}

          <FormField
            label="Title"
            value={title}
            onChange={setTitle}
            placeholder="Travel 2026"
            disabled={busy}
          />
          <FormField
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What this notebook is for"
            required={false}
            disabled={busy}
          />

          <fieldset>
            <legend className="mb-2 block text-sm text-ink-soft">Colour</legend>
            <div className="flex gap-2">
              {JOURNAL_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  aria-label={option}
                  aria-pressed={color === option}
                  className={`h-8 w-8 rounded-full border-2 transition-colors duration-150 ${
                    SWATCH[option]
                  } ${
                    color === option ? "border-ink" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </fieldset>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="h-11 flex-1 rounded-[var(--radius-sm)] border border-line text-sm text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink"
            >
              Cancel
            </button>
            <SubmitButton busy={busy} disabled={!title.trim()} className="flex-1">
              Create
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
