"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { Calendar } from "lucide-react";
import Modal from "@/components/Modal";
import MediaAttachment from "@/components/MediaAttachment";
import type { PublicLetter } from "@/lib/api";

// Bodies are sanitized server-side on write, which is the real control. This
// is a second layer for rows written before that existed, and for anything a
// future API change might let through.
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
  "blockquote", "code", "pre", "h1", "h2", "h3", "h4",
  "ul", "ol", "li", "a", "span",
];

/** The full letter, opened from a feed card. */
export default function LetterReader({
  letter,
  onClose,
}: {
  letter: PublicLetter | null;
  onClose: () => void;
}) {
  const clean = useMemo(
    () =>
      letter
        ? DOMPurify.sanitize(letter.body, {
            ALLOWED_TAGS,
            ALLOWED_ATTR: ["href", "title", "rel", "target"],
          })
        : "",
    [letter]
  );

  return (
    <Modal
      open={letter !== null}
      onClose={onClose}
      size="lg"
      title={letter?.subject ?? ""}
    >
      {letter && (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line pb-4 text-xs text-ink-muted">
            <span className="font-medium uppercase tracking-[0.16em] text-accent-text">
              From: {letter.sender_name ?? "Anonymous"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              Delivered{" "}
              {new Date(letter.deliver_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div
            className="rich-text mt-5 leading-relaxed text-ink-soft"
            dangerouslySetInnerHTML={{ __html: clean }}
          />

          {letter.media_url && (
            <div className="mt-6 overflow-hidden rounded-[var(--radius-md)] border border-line">
              <MediaAttachment
                url={letter.media_url}
                mediaType={letter.media_type}
              />
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
