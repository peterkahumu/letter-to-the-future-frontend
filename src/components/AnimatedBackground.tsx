"use client";

/**
 * Animated gradient orbs that float in the background,
 * giving the page a premium, dynamic feel.
 */
export default function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Top-right orb */}
      <div
        className="orb orb-1"
        style={{ top: "-10%", right: "-5%", animationDelay: "0s" }}
      />
      {/* Bottom-left orb */}
      <div
        className="orb orb-2"
        style={{ bottom: "-5%", left: "-8%", animationDelay: "5s" }}
      />
      {/* Center-right orb */}
      <div
        className="orb orb-3"
        style={{ top: "40%", right: "15%", animationDelay: "10s" }}
      />
    </div>
  );
}
