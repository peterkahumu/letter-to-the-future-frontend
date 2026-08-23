"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { api, type PublicLetter } from "@/lib/api";
import ReportDialog from "@/components/ReportDialog";
import MediaAttachment from "@/components/MediaAttachment";
import { Loader2, Calendar, Flag } from "lucide-react";

// Bodies are sanitized server-side on write, which is the real control.
// This is a second layer for rows written before that existed, and for
// anything a future API change might let through.
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
  "blockquote", "code", "pre", "h1", "h2", "h3", "h4",
  "ul", "ol", "li", "a", "span",
];

function LetterBody({ html }: { html: string }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ["href", "title", "rel", "target"],
      }),
    [html]
  );
  return (
    <div
      className="rich-text text-ink-soft leading-relaxed"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export default function PublicBoard() {
  const [letters, setLetters] = useState<PublicLetter[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const [reportingId, setReportingId] = useState<string | null>(null);

  const load = useCallback(async (next?: string) => {
    const page = await api.getPublicLetters(next);
    setLetters((prev) => (next ? [...prev, ...page.items] : page.items));
    setCursor(page.next_cursor);
  }, []);

  useEffect(() => {
    load()
      .catch((e) => console.error("Failed to load public letters:", e))
      .finally(() => setIsLoading(false));
  }, [load]);

  const loadMore = async () => {
    if (!cursor) return;
    setIsLoadingMore(true);
    try {
      await load(cursor);
    } catch (e) {
      console.error("Failed to load more letters:", e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-16">
      <header className="mb-12 text-center animate-rise">
        <h1 className="font-display text-4xl text-ink md:text-5xl lg:text-6xl">
          Public Board
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
          Letters that have reached their destination, shared with the world.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : letters.length === 0 ? (
        <div className="text-center py-20 text-ink-muted border border-line border-dashed rounded-[var(--radius-lg)]">
          No public letters yet. Be the first to share your letter with the world!
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 animate-fade">
            {letters.map((letter) => (
              <article
                key={letter.id}
                className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-elevated shadow-[var(--shadow-md)]"
              >
                <div className="perforated-top" />

                <div className="flex items-center justify-between border-b border-line px-6 py-3.5 bg-surface/30">
                  <div className="text-xs uppercase tracking-[0.16em] text-accent-text font-medium">
                    From: {letter.sender_name ?? "Anonymous"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <Calendar size={12} />
                    {new Date(letter.deliver_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div className="px-6 pt-5 pb-2">
                  <h2 className="font-display text-2xl text-ink">{letter.subject}</h2>
                </div>

                <div className="px-6 pb-6 flex-1">
                  <LetterBody html={letter.body} />
                </div>

                {letter.media_url && (
                  <div className="border-t border-line bg-surface/20 flex justify-center">
                    <MediaAttachment
                      url={letter.media_url}
                      mediaType={letter.media_type}
                    />
                  </div>
                )}

                <div className="border-t border-line px-6 py-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setReportingId(letter.id)}
                    disabled={reported.has(letter.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors duration-200 hover:text-danger disabled:opacity-60"
                  >
                    <Flag size={12} />
                    {reported.has(letter.id) ? "Reported" : "Report"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {cursor && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-sm)] border border-line px-6 text-base font-medium text-ink transition-colors duration-200 hover:border-line-strong disabled:opacity-60"
              >
                {isLoadingMore ? "Loading…" : "Load more letters"}
              </button>
            </div>
          )}
        </>
      )}

      <ReportDialog
        letterId={reportingId}
        onClose={() => setReportingId(null)}
        onReported={(id) => setReported((prev) => new Set(prev).add(id))}
      />
    </main>
  );
}
