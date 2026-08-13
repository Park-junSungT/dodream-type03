/**
 * Where the DoDream cane model comes from.
 *
 * ─── Swapping in the real model ────────────────────────────────────────────
 *  1. Drop the file at `public/models/dodream-cane.glb`
 *     (Draco/Meshopt compressed is fine — the loader handles both).
 *  2. Set `NEXT_PUBLIC_CANE_MODEL=1`, or flip `FORCE_GLB` below to `true`.
 *
 * Nothing else needs to change:
 *  • `SmartCaneModel` measures the GLB and normalises it into cane space
 *    (tip at y = -1, top of the handle at y = +1, shaft on the y axis), so the
 *    choreography and hotspot anchors carry over unchanged.
 *  • Hotspots fall back to the anchors in `lib/features.ts`. If the GLB
 *    contains empties named `hotspot_handle`, `hotspot_sensors`, … those win,
 *    letting the model author re-place them without a code change.
 *  • If the file is missing or fails to parse, the procedural cane renders in
 *    its place and the page carries on.
 */

export const CANE_MODEL_URL = "/models/dodream-cane.glb";

/** Set to `true` to load the GLB without needing an environment variable. */
const FORCE_GLB = false;

export const USE_GLB_MODEL =
  FORCE_GLB || process.env.NEXT_PUBLIC_CANE_MODEL === "1";

/**
 * Target height of the cane in world units. Both the procedural placeholder
 * and an imported GLB are normalised to this, so the camera work is stable
 * across model revisions.
 */
export const CANE_HEIGHT = 2;

/** Extra transform applied after normalisation, if a GLB needs nudging. */
export const GLB_ADJUST = {
  /** Radians. Rotate if the model's "front" faces the wrong way. */
  yaw: 0,
  /** Multiplier on the normalised scale. */
  scale: 1,
} as const;
