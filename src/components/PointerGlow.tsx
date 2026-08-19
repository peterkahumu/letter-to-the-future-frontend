"use client";

import { useEffect, useRef } from "react";

/**
 * Follows the cursor across its parent element with a soft turquoise wash.
 * Skipped entirely on touch devices and when reduced motion is requested.
 */
export default function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = ref.current;
    const area = glow?.parentElement;
    if (!glow || !area) return;

    const unsupported =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (unsupported) return;

    let frame = 0;

    const handleMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = area.getBoundingClientRect();
        glow.style.setProperty("--glow-x", `${event.clientX - bounds.left}px`);
        glow.style.setProperty("--glow-y", `${event.clientY - bounds.top}px`);
        glow.style.opacity = "1";
      });
    };

    const handleLeave = () => {
      cancelAnimationFrame(frame);
      glow.style.opacity = "0";
    };

    area.addEventListener("pointermove", handleMove);
    area.addEventListener("pointerleave", handleLeave);

    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener("pointermove", handleMove);
      area.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return <div ref={ref} className="pointer-glow" aria-hidden="true" />;
}
