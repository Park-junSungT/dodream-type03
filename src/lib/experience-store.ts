import { useSyncExternalStore } from "react";
import { DEFAULT_TIER, type DeviceTier, type LayoutMode } from "./quality";

/**
 * Shared experience state.
 *
 * Two channels, deliberately separated:
 *
 * 1. `motion` — a plain mutable object written every frame (scroll position,
 *    pointer, drag, pinch). The render loop reads it directly, so continuous
 *    input never triggers a React render.
 * 2. The store below — low-frequency, discrete state (which hotspot is open,
 *    which chapter we are in, is the scene ready). Components subscribe with
 *    a selector and only re-render when their slice changes.
 *
 * It lives at module scope rather than in a context because the WebGL canvas
 * runs in its own React reconciler root; a module singleton is readable from
 * both trees without bridging.
 */

export type MotionState = {
  /** 0–1 across the whole document. */
  scroll: number;
  /** Continuous position on the chapter axis (see lib/choreography). */
  chapterAxis: number;
  /** Normalised pointer, -1..1, origin at viewport centre. */
  pointerX: number;
  pointerY: number;
  /** True while a pointer is over the stage (drives hover response). */
  pointerActive: boolean;
  /** User-accumulated yaw from dragging, radians. */
  dragYaw: number;
  /** Residual yaw velocity after a flick, radians per second. */
  dragVelocity: number;
  /** User-accumulated camera elevation from dragging, radians (clamped). */
  dragPitch: number;
  dragging: boolean;
  /** Pinch/zoom multiplier applied to camera distance, clamped. */
  zoom: number;
  layout: LayoutMode;
  /** Blend weight toward the focused hotspot pose, 0–1. */
  focusWeight: number;
};

export const motion: MotionState = {
  scroll: 0,
  chapterAxis: 0,
  pointerX: 0,
  pointerY: 0,
  pointerActive: false,
  dragYaw: 0,
  dragVelocity: 0,
  dragPitch: 0,
  dragging: false,
  zoom: 1,
  layout: "desktop",
  focusWeight: 0,
};

export function resetUserOrbit() {
  motion.dragYaw = 0;
  motion.dragVelocity = 0;
  motion.dragPitch = 0;
  motion.zoom = 1;
}

export type ExperienceState = {
  /** Nearest chapter index, used for chrome and copy transitions. */
  chapter: number;
  /** Currently focused hotspot, or null for the full product view. */
  activeFeature: string | null;
  /** The product is framed for inspection — hotspots are live and focusable. */
  exploring: boolean;
  /** First WebGL frame has been presented. */
  sceneReady: boolean;
  /** WebGL unavailable or the scene threw — the poster fallback is showing. */
  sceneFailed: boolean;
  /** Intro overlay has finished and the page is scrollable. */
  introComplete: boolean;
  waitlistOpen: boolean;
  /** Set once a submission succeeds, so the page can acknowledge it. */
  waitlistJoined: boolean;
  menuOpen: boolean;
  tier: DeviceTier;
  /** True once a drag has happened — used to retire the interaction hint. */
  hasInteracted: boolean;
};

const initialState: ExperienceState = {
  chapter: 0,
  activeFeature: null,
  exploring: false,
  sceneReady: false,
  sceneFailed: false,
  introComplete: false,
  waitlistOpen: false,
  waitlistJoined: false,
  menuOpen: false,
  tier: DEFAULT_TIER,
  hasInteracted: false,
};

let state: ExperienceState = initialState;
const listeners = new Set<() => void>();

function set(patch: Partial<ExperienceState>) {
  let changed = false;
  for (const key of Object.keys(patch) as (keyof ExperienceState)[]) {
    if (state[key] !== patch[key]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const experience = {
  get: () => state,
  set,
  setChapter: (chapter: number) => set({ chapter }),
  setActiveFeature: (activeFeature: string | null) => {
    if (activeFeature === null) resetUserOrbit();
    set({ activeFeature });
  },
  toggleFeature: (id: string) => {
    const next = state.activeFeature === id ? null : id;
    if (next === null) resetUserOrbit();
    set({ activeFeature: next });
  },
  setExploring: (exploring: boolean) => {
    // Leaving the exploration chapter always returns to the full product view.
    if (!exploring && state.activeFeature) {
      resetUserOrbit();
      set({ exploring, activeFeature: null });
      return;
    }
    set({ exploring });
  },
  setSceneReady: (sceneReady: boolean) => set({ sceneReady }),
  setSceneFailed: (sceneFailed: boolean) =>
    set({ sceneFailed, sceneReady: true }),
  setIntroComplete: (introComplete: boolean) => set({ introComplete }),
  setWaitlistOpen: (waitlistOpen: boolean) => set({ waitlistOpen }),
  setWaitlistJoined: (waitlistJoined: boolean) => set({ waitlistJoined }),
  setMenuOpen: (menuOpen: boolean) => set({ menuOpen }),
  setTier: (tier: DeviceTier) => set({ tier }),
  markInteracted: () => {
    if (!state.hasInteracted) set({ hasInteracted: true });
  },
};

/**
 * Subscribe to one slice of experience state. The selector must return a
 * primitive (or a stable reference) so React can compare snapshots cheaply.
 */
export function useExperience<T>(selector: (snapshot: ExperienceState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}
