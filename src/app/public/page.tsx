"use client";

import { useEffect, useState } from "react";
import { api, type LetterResponse } from "@/lib/api";
import { Loader2, Calendar } from "lucide-react";

export default function PublicBoard() {
  const [letters, setLetters] = useState<LetterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLetters() {
      try {
        const data = await api.getPublicLetters();
        setLetters(data);
      } catch (e) {
        console.error("Failed to load public letters:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLetters();
  }, []);

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
        <div className="grid gap-8 md:grid-cols-2 animate-fade">
          {letters.map((letter) => (
            <article 
              key={letter.id} 
              className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-elevated shadow-[var(--shadow-md)]"
            >
              <div className="perforated-top" />
              
              <div className="flex items-center justify-between border-b border-line px-6 py-3.5 bg-surface/30">
                <div className="text-xs uppercase tracking-[0.16em] text-accent-text font-medium">
                  From: {letter.is_anonymous ? "Anonymous" : (letter.sender_name || "Anonymous")}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Calendar size={12} />
                  {new Date(letter.deliver_at).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </div>
              </div>

              <div className="px-6 pt-5 pb-2">
                <h2 className="font-display text-2xl text-ink">{letter.subject}</h2>
              </div>

              <div className="px-6 pb-6 flex-1">
                <div 
                  className="rich-text text-ink-soft leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: letter.body }}
                />
              </div>

              {letter.media_url && (
                <div className="border-t border-line bg-surface/20 flex justify-center">
                  <img 
                    src={letter.media_url} 
                    alt="Letter attachment" 
                    className="w-full h-auto object-cover max-h-[400px]"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
