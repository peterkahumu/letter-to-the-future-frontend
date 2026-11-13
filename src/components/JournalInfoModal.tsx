"use client";

import Link from "next/link";
import { Lock, NotebookPen, Sparkles } from "lucide-react";
import Modal from "@/components/Modal";

interface JournalInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JournalInfoModal({
  open,
  onClose,
}: JournalInfoModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Journals & Daily Entries"
      description="Private notebooks you can revisit, edit, and rewrite — offered for registered members."
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          Unlike time-capsule letters that remain sealed until their delivery date,
          journals are your personal notebooks. Write dated entries,
          reflect on daily thoughts, and revisit or edit your reflections anytime.
        </p>

        <div className="rounded-[var(--radius-md)] border border-line bg-surface p-4 space-y-3 text-xs text-ink-muted">
          <div className="flex items-start gap-2.5">
            <Lock className="h-4 w-4 shrink-0 text-accent-text mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-ink font-medium">100% Private:</strong> Your journal entries are completely confidential. There is no public sharing or admin viewing.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <NotebookPen className="h-4 w-4 shrink-0 text-accent-text mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-ink font-medium">Multiple Notebooks:</strong> Organize by project, personal reflection, or travel with custom palette colors and mood tracking.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-accent-text mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-ink font-medium">Rich Writing Experience:</strong> Write with rich text formatting, dated stamps, and time markers whenever inspiration strikes.
            </div>
          </div>
        </div>

        <p className="text-xs text-ink-soft">
          This feature is available to all registered users. Accounts are free, private, and keep your letters and notebooks in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link
            href="/login?next=/dashboard/journals"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-on transition-colors duration-200 hover:bg-accent-hover"
          >
            Sign in to Journals
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong px-4 text-sm font-medium text-ink-soft transition-colors duration-200 hover:border-line-hover hover:text-ink"
          >
            Create free account
          </Link>
        </div>
      </div>
    </Modal>
  );
}
