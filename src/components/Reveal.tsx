"use client";

import { useCallback, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  /** Optional: a decorative reveal (a drawn line, a stamp) has no content. */
  children?: ReactNode;
  /** Extra classes for the wrapper. */
  className?: string;
  /** Animation class applied once the element scrolls into view. */
  effect?: "reveal" | "animate-stamp";
  /** Staggers siblings: 0–500ms, matching the delay-* utilities. */
  delay?: 0 | 100 | 200 | 300 | 400 | 500;
  as?: ElementType;
}

/**
 * Reveals its children the first time they scroll into view.
 *
 * The animation itself lives in CSS, so the reduced-motion rule in
 * globals.css collapses it to an instant appearance rather than needing a
 * separate code path here. Anything unobservable (no IntersectionObserver,
 * JS disabled mid-hydration) falls back to visible.
 */
export default function Reveal({
  children,
  className = "",
  effect = "reveal",
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const [visible, setVisible] = useState(false);

  const observe = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        // One-way: re-animating on every scroll past is noise, not delight.
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={observe}
      className={`${effect} ${visible ? "is-visible" : ""} ${
        delay ? `delay-${delay}` : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
