/**
 * Device capability detection.
 *
 * The goal is never a different design — only a different rendering budget.
 * Every tier renders the same product, the same story and the same
 * interactions; what changes is resolution, shadow fidelity and geometry
 * density.
 */

export type DeviceTier = "high" | "balanced" | "low";

export type LayoutMode = "mobile" | "tablet" | "desktop";

export type QualityProfile = {
  tier: DeviceTier;
  /** Clamp for the renderer's device pixel ratio, [min, max]. */
  dpr: [number, number];
  antialias: boolean;
  /** Real-time shadow map from the key light. */
  shadows: boolean;
  shadowMapSize: number;
  /** Soft ground shadow under the product. */
  contactShadows: boolean;
  contactShadowResolution: number;
  contactShadowBlur: number;
  /** Cube resolution for the in-scene studio environment. */
  envResolution: number;
  /** Radial segments for the cane's turned parts. */
  radialSegments: number;
  /** Samples along the handle sweep. */
  curveSegments: number;
  /** MeshPhysicalMaterial (clearcoat) vs. the cheaper MeshStandardMaterial. */
  physicalMaterials: boolean;
};

const PROFILES: Record<DeviceTier, QualityProfile> = {
  high: {
    tier: "high",
    dpr: [1, 2],
    antialias: true,
    shadows: true,
    shadowMapSize: 1024,
    contactShadows: true,
    contactShadowResolution: 512,
    contactShadowBlur: 2.6,
    envResolution: 256,
    radialSegments: 40,
    curveSegments: 96,
    physicalMaterials: true,
  },
  balanced: {
    tier: "balanced",
    dpr: [1, 1.6],
    antialias: true,
    shadows: false,
    shadowMapSize: 512,
    contactShadows: true,
    contactShadowResolution: 320,
    contactShadowBlur: 2.4,
    envResolution: 128,
    radialSegments: 28,
    curveSegments: 64,
    physicalMaterials: true,
  },
  low: {
    tier: "low",
    dpr: [0.85, 1.25],
    antialias: false,
    shadows: false,
    shadowMapSize: 256,
    contactShadows: true,
    contactShadowResolution: 192,
    contactShadowBlur: 2.2,
    envResolution: 64,
    radialSegments: 18,
    curveSegments: 40,
    physicalMaterials: false,
  },
};

export function getQualityProfile(tier: DeviceTier): QualityProfile {
  return PROFILES[tier];
}

/** Server render and first paint assume the middle of the road. */
export const DEFAULT_TIER: DeviceTier = "balanced";

let cachedTier: DeviceTier | null = null;

/**
 * Best-effort tier detection. Deliberately conservative: an unknown device
 * lands on `balanced`, which looks correct everywhere and costs little.
 */
export function detectDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return DEFAULT_TIER;
  if (cachedTier) return cachedTier;

  const nav = window.navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const dpr = window.devicePixelRatio || 1;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 820px)").matches;
  const handheld = coarsePointer && narrow;

  // Score upward from a neutral baseline.
  let score = 0;

  if (cores >= 8) score += 2;
  else if (cores >= 6) score += 1;
  else if (cores <= 3) score -= 2;

  if (memory >= 8) score += 2;
  else if (memory >= 6) score += 1;
  else if (memory <= 2) score -= 2;

  // A high-density panel on a small device means many more pixels to fill.
  if (handheld && dpr >= 3) score -= 1;
  if (handheld) score -= 1;

  const renderer = readRendererName();
  if (renderer) {
    const name = renderer.toLowerCase();
    // Software rasterisers cannot carry the full scene.
    if (name.includes("swiftshader") || name.includes("llvmpipe")) return "low";
    if (name.includes("apple m") || name.includes("rtx") || name.includes("radeon pro")) {
      score += 2;
    }
    // Older mobile GPU families.
    if (/mali-t|mali-g5|adreno \(tm\) [45]/.test(name)) score -= 2;
  }

  const tier: DeviceTier = score >= 3 ? "high" : score <= -2 ? "low" : "balanced";
  cachedTier = tier;
  return tier;
}

function readRendererName(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext
      ? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string)
      : (gl.getParameter(gl.RENDERER) as string);
    // Release the throwaway context immediately.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return typeof name === "string" ? name : null;
  } catch {
    return null;
  }
}

/** Whether WebGL can run at all — decides between the canvas and the fallback. */
export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Layout breakpoints deliberately match Tailwind's `md` and `lg`, so the
 * camera framing and the DOM layout always change on the same pixel. A
 * "tablet" here is any viewport still using the stacked layout with the
 * information panel docked below the product.
 */
export function layoutFromWidth(width: number): LayoutMode {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/** One step down, used when the frame budget is missed at runtime. */
export function degradeTier(tier: DeviceTier): DeviceTier {
  return tier === "high" ? "balanced" : "low";
}
