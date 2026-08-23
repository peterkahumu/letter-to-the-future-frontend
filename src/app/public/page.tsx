"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api, type PublicLetter } from "@/lib/api";
import PublicLetterCard from "@/components/PublicLetterCard";
import LetterReader from "@/components/LetterReader";
import ReportDialog from "@/components/ReportDialog";

export default function PublicBoard() {
  const [letters, setLetters] = useState<PublicLetter[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reading, setReading] = useState<PublicLetter | null>(null);

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
    // Wider than the writing pages: this one is a grid, and on a large screen
    // the old max-w-5xl left most of the viewport empty.
    <div className="mx-auto w-full max-w-[1600px] px-5 py-12 sm:px-8 lg:py-16">
      <header className="animate-rise mb-12 text-center">
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
        <div className="rounded-[var(--radius-lg)] border border-dashed border-line py-20 text-center text-ink-muted">
          No public letters yet. Be the first to share your letter with the world!
        </div>
      ) : (
        <>
          {/* auto-fill rather than a fixed column count: the cards wrap to
              however many fit, so a wide monitor gets four or five instead of
              two and a lot of margin. */}
          <div className="animate-fade grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
            {letters.map((letter) => (
              <PublicLetterCard
                key={letter.id}
                letter={letter}
                reported={reported.has(letter.id)}
                onRead={() => setReading(letter)}
                onReport={() => setReportingId(letter.id)}
              />
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

      <LetterReader letter={reading} onClose={() => setReading(null)} />

      <ReportDialog
        letterId={reportingId}
        onClose={() => setReportingId(null)}
        onReported={(id) => setReported((prev) => new Set(prev).add(id))}
      />
    </div>
  );
}
