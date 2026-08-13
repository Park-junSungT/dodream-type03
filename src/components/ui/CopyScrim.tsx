"use client";

/**
 * On a phone the product and the copy compete for the same 390 pixels. Rather
 * than shrink the product until it stops being the point, a soft wash of the
 * stage colour sits between them — the cane stays large and present, and the
 * writing stays readable on top of it.
 *
 * Wide screens have room for both, so the scrim is mobile-only.
 */
export function CopyScrim({
  edge,
  size = "34svh",
  className = "",
}: {
  edge: "top" | "bottom";
  size?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 lg:hidden ${
        edge === "top" ? "top-0" : "bottom-0"
      } ${className}`}
      style={{
        height: size,
        background: `linear-gradient(to ${edge === "top" ? "bottom" : "top"}, var(--stage-bg) 0%, transparent 100%)`,
      }}
    />
  );
}
