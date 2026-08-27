"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, Search, Settings2 } from "lucide-react";
import {
  api,
  ApiRequestError,
  JOURNAL_COLORS,
  type EntrySummary,
  type Journal,
  type JournalColor,
  type JournalEntry,
} from "@/lib/api";
import EntryEditor from "@/components/EntryEditor";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import Alert from "@/components/Alert";
import { formatDate, formatDateTime } from "@/lib/format";

const PAGE_SIZE = 20;

const SWATCH: Record<JournalColor, string> = {
  turquoise: "bg-[var(--turquoise-400)]",
  gold: "bg-[var(--stamp)]",
  rose: "bg-[#f0929a]",
  violet: "bg-[#b49bf0]",
  amber: "bg-[#f0b45a]",
  slate: "bg-[#8ba3a0]",
};

export default function JournalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [writing, setWriting] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadEntries = useCallback(
    async (offset: number, term: string) => {
      const page = await api.getEntries(id, {
        limit: PAGE_SIZE,
        offset,
        search: term || undefined,
      });
      setTotal(page.total);
      setHasMore(page.has_more);
      setEntries((current) =>
        offset === 0 ? page.items : [...current, ...page.items]
      );
    },
    [id]
  );

  useEffect(() => {
    let stale = false;

    Promise.all([api.getJournal(id), api.getEntries(id, { limit: PAGE_SIZE })])
      .then(([loadedJournal, page]) => {
        if (stale) return;
        setJournal(loadedJournal);
        setEntries(page.items);
        setTotal(page.total);
        setHasMore(page.has_more);
      })
      .catch((err) => {
        if (stale) return;
        setError(
          err instanceof ApiRequestError && err.status === 404
            ? "That journal doesn't exist, or isn't yours."
            : "Couldn't load this journal."
        );
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [id]);

  // Debounced search — one request after typing stops, not one per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadEntries(0, search).catch(() => setError("Search failed."));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadEntries]);

  async function openForEdit(entryId: string) {
    try {
      // The list carries excerpts, so fetch the full body to edit it.
      setEditing(await api.getEntry(entryId));
    } catch {
      setError("Couldn't open that entry.");
    }
  }

  function handleSaved() {
    setWriting(false);
    setEditing(null);
    void loadEntries(0, search);
  }

  if (error && !journal) {
    return (
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <Link
          href="/dashboard/journals"
          className="inline-flex items-center gap-2 text-sm text-accent-text hover:text-accent-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to journals
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/journals"
        className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink-soft"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All journals
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {journal && (
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${
                  SWATCH[journal.color] ?? SWATCH.turquoise
                }`}
                aria-hidden="true"
              />
            )}
            <h1 className="font-display text-3xl text-ink">
              {journal?.title ?? "…"}
            </h1>
          </div>
          {journal?.description && (
            <p className="mt-1.5 text-sm text-ink-soft">{journal.description}</p>
          )}
          <p className="mt-1 text-xs text-ink-muted">
            {total} {total === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            disabled={!journal}
            aria-label="Journal settings"
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-line text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink disabled:opacity-50"
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="flex h-10 items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New entry
          </button>
        </div>
      </header>

      {error && <Alert>{error}</Alert>}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search this journal"
          aria-label="Search entries"
          className="w-full rounded-[var(--radius-sm)] border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-muted"
        />
      </div>

      {loading ? (
        <ul className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="h-24 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface"
            />
          ))}
        </ul>
      ) : entries.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface/50 p-12 text-center">
          <p className="text-sm text-ink">
            {search ? "Nothing matches that." : "This journal is empty."}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setWriting(true)}
              className="mt-4 inline-flex h-9 items-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
            >
              Write the first entry
            </button>
          )}
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => void openForEdit(entry.id)}
                  className="group w-full rounded-[var(--radius-md)] border border-line bg-surface p-4 text-left transition-colors duration-200 hover:border-line-strong sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 flex-1 truncate text-sm text-ink sm:text-base">
                      {entry.title || "Untitled entry"}
                    </h2>
                    <div className="flex shrink-0 items-center gap-2">
                      {entry.mood && (
                        <span className="rounded-[var(--radius-full)] border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">
                          {entry.mood}
                        </span>
                      )}
                      <Pencil
                        className="h-3.5 w-3.5 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                    {entry.excerpt}
                  </p>

                  <p className="mt-2.5 text-[11px] text-ink-muted">
                    {formatDate(entry.entry_date)}
                    {entry.updated_at !== entry.entry_date && (
                      <span> · edited {formatDateTime(entry.updated_at)}</span>
                    )}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              type="button"
              onClick={() => void loadEntries(entries.length, search)}
              className="mx-auto flex h-10 items-center rounded-[var(--radius-sm)] border border-line px-5 text-sm text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink"
            >
              Load more
            </button>
          )}
        </>
      )}

      <Modal
        open={writing || editing !== null}
        onClose={() => {
          setWriting(false);
          setEditing(null);
        }}
        title={editing ? "Edit entry" : "New entry"}
        description={
          editing
            ? "Change anything. Entries are yours to revise."
            : undefined
        }
        size="lg"
      >
        <EntryEditor
          // Remount when switching entries, so the form resets cleanly.
          key={editing?.id ?? "new"}
          journalId={id}
          entry={editing}
          onSaved={handleSaved}
          onCancel={() => {
            setWriting(false);
            setEditing(null);
          }}
          onDeleted={handleSaved}
        />
      </Modal>

      {journal && settingsOpen && (
        <JournalSettings
          journal={journal}
          onClose={() => setSettingsOpen(false)}
          onUpdated={setJournal}
          onDeleted={() => router.push("/dashboard/journals")}
        />
      )}
    </div>
  );
}

/**
 * Rendered only while open, so each visit mounts with the journal's current
 * values — no effect needed to keep the form in step with its props.
 */
function JournalSettings({
  journal,
  onClose,
  onUpdated,
  onDeleted,
}: {
  journal: Journal;
  onClose: () => void;
  onUpdated: (journal: Journal) => void;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(journal.title);
  const [description, setDescription] = useState(journal.description ?? "");
  const [color, setColor] = useState<JournalColor>(journal.color);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function save() {
    setBusy(true);
    setError("");
    try {
      onUpdated(
        await api.updateJournal(journal.id, {
          title,
          description: description.trim() || null,
          color,
        })
      );
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleArchive() {
    setBusy(true);
    try {
      onUpdated(
        await api.updateJournal(journal.id, { is_archived: !journal.is_archived })
      );
      onClose();
    } catch {
      setError("Couldn't change that.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api.deleteJournal(journal.id);
      onDeleted();
    } catch {
      setError("Couldn't delete it.");
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Journal settings">
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}

        <FormField label="Title" value={title} onChange={setTitle} disabled={busy} />
        <FormField
          label="Description"
          value={description}
          onChange={setDescription}
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
                } ${color === option ? "border-ink" : "border-transparent"}`}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-[var(--radius-sm)] border border-line text-sm text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink"
          >
            Cancel
          </button>
          <SubmitButton
            type="button"
            onClick={() => void save()}
            busy={busy}
            disabled={!title.trim()}
            className="flex-1"
          >
            Save
          </SubmitButton>
        </div>

        <div className="space-y-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => void toggleArchive()}
            disabled={busy}
            className="h-10 w-full rounded-[var(--radius-sm)] border border-line text-sm text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink"
          >
            {journal.is_archived ? "Unarchive" : "Archive"} this journal
          </button>

          <button
            type="button"
            onClick={() =>
              confirmingDelete ? void remove() : setConfirmingDelete(true)
            }
            disabled={busy}
            className={`h-10 w-full rounded-[var(--radius-sm)] border text-sm transition-colors duration-200 ${
              confirmingDelete
                ? "border-danger-line bg-danger-tint text-danger"
                : "border-line text-ink-muted hover:border-danger-line hover:text-danger"
            }`}
          >
            {confirmingDelete
              ? `Delete it and all ${journal.entry_count} entries?`
              : "Delete this journal"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
