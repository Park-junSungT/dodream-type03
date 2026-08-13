/**
 * Anchor navigation that respects motion preferences and never leaves the
 * reader mid-transition. Falls back to the browser's own behaviour if the
 * target is missing.
 */
export function scrollToChapter(id: string) {
  if (typeof window === "undefined") return;
  const element = document.getElementById(id);
  if (!element) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({
    behavior: reduced ? "auto" : "smooth",
    block: "start",
  });

  // Move focus with the viewport so keyboard and screen-reader users land in
  // the section they asked for.
  element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
}
