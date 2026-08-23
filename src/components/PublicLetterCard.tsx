"use client";

import { useMemo } from "react";
import { Calendar, Flag, Music, Play } from "lucide-react";
import { resolveKind } from "@/components/MediaAttachment";
import type { PublicLetter } from "@/lib/api";

/**
 * Body text for the excerpt, with the markup taken out.
 *
 * The feed's job is a uniform grid, and letting headings, lists and block
 * quotes through makes every card a different shape. The full formatting is
 * still there when the letter is opened.
 */
function toPlainText(html: string): string {
  if (typeof DOMParser !== "undefined") {
    return (
      new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
    ).replace(/\s+/g, " ").trim();
  }
  // Prerender fallback — the feed loads client-side, so this rarely runs.
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  letter: PublicLetter;
  reported: boolean;
  onRead: () => void;
  onReport: () => void;
}

export default function PublicLetterCard({
  letter,
  reported,
  onRead,
  onReport,
}: Props) {
  const excerpt = useMemo(() => toPlainText(letter.body), [letter.body]);
  const kind = resolveKind(letter.media_type, letter.media_url);

  return (
    // Fixed height from sm up so every card in the grid matches. Left to grow
    // on phones, where there is a single column and clipping would only lose
    // text for no gain.
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-elevated shadow-[var(--shadow-md)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)] sm:h-[27rem]">
      <div className="perforated-top shrink-0" />

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/30 px-5 py-3">
        <span className="truncate text-xs font-medium uppercase tracking-[0.16em] text-accent-text">
          {letter.sender_name ?? "Anonymous"}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink-muted">
          <Calendar size={12} />
          {formatDate(letter.deliver_at)}
        </span>
      </div>

      {letter.media_url && (
        <div className="shrink-0 border-b border-line bg-surface/20">
          {kind === "image" && (
            <img
              src={letter.media_url}
              alt=""
              loading="lazy"
              className="h-36 w-full object-cover"
            />
          )}

          {kind === "video" && (
            <div className="relative h-36 w-full">
              <video
                src={letter.media_url}
                preload="metadata"
                muted
                playsInline
                className="h-36 w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-[var(--scrim-soft)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-full)] bg-paper/90 text-ink">
                  <Play size={18} />
                </span>
              </span>
            </div>
          )}

          {kind === "audio" && (
            <p className="flex items-center gap-2 px-5 py-3 text-xs text-ink-soft">
              <Music size={14} className="text-accent-text" />
              Audio attached
            </p>
          )}

          {kind === null && (
            <p className="px-5 py-3 text-xs text-ink-soft">File attached</p>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-4">
        <h2 className="line-clamp-2 shrink-0 font-display text-xl leading-snug text-ink">
          {letter.subject}
        </h2>
        <p className="excerpt-fade mt-2 min-h-0 flex-1 overflow-hidden text-[0.9rem] leading-relaxed text-ink-soft">
          {excerpt}
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-line px-5 py-3">
        <button
          type="button"
          onClick={onRead}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-text transition-opacity duration-200 hover:opacity-75"
        >
          Read more
          <span aria-hidden="true">→</span>
          <span className="sr-only">: {letter.subject}</span>
        </button>

        <button
          type="button"
          onClick={onReport}
          disabled={reported}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors duration-200 hover:text-danger disabled:opacity-60"
        >
          <Flag size={12} />
          {reported ? "Reported" : "Report"}
        </button>
      </div>
    </article>
  );
}
