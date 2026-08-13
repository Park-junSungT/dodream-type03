"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Motion preference, read safely across the server/client boundary.
 *
 * Framer Motion's own `useReducedMotion` samples the media query during the
 * first render, which makes the server and client disagree and trips
 * hydration — and it never updates if the preference changes mid-session.
 * `useSyncExternalStore` solves both: the server snapshot is always `false`,
 * so hydration matches, and React re-renders with the real value immediately
 * afterwards, before anything has had a chance to animate.
 */
function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
