/**
 * Product hotspots.
 *
 * Anchors are expressed in *cane space*: a normalised coordinate system where
 * the cane stands upright, its tip at y = -1, the top of the handle at y = +1
 * and the shaft on the y axis. `SmartCaneModel` normalises whatever geometry
 * it renders — procedural placeholder or a real GLB — into that space, so
 * these anchors keep working when the real model arrives.
 *
 * If a supplied GLB contains empties named after `nodeName`, those are used
 * instead of the fallback anchor, letting the 3D artist re-place hotspots
 * without touching code.
 */

export type Vec3 = [number, number, number];

export type ProductFeature = {
  id: string;
  /** Short label rendered on the hotspot marker and in the rail. */
  label: string;
  /** Headline of the information panel. */
  title: string;
  /** One or two calm sentences. No medical or safety claims. */
  body: string;
  /** Optional supporting spec line. */
  detail: string;
  /** Anchor in cane space. */
  anchor: Vec3;
  /** Optional empty/node name looked up in a supplied GLB. */
  nodeName: string;
  /** Camera placement when this feature is focused, in cane space. */
  focus: {
    camera: Vec3;
    /** Look-at point; defaults to the anchor when omitted. */
    target?: Vec3;
    /**
     * Cane rotation (radians, Y axis) that turns this feature toward the
     * camera during focus.
     */
    rotation: number;
  };
};

/*
 * Anchors and focus cameras are measured off the product reference. They run
 * top to bottom down the cane, which is also the order the markers are
 * numbered in: 01 at the grip, 06 at the port in the base.
 */
export const PRODUCT_FEATURES: readonly ProductFeature[] = [
  {
    id: "handle",
    label: "Smart Handle",
    title: "Smart Handle",
    body: "Controls and sensing sit inside the grip, where the hand already rests. Nothing new to reach for.",
    detail: "Machined aluminium core, soft-touch polymer grip",
    anchor: [0.0, 0.8, 0.036],
    nodeName: "hotspot_handle",
    focus: {
      camera: [0.27, 0.884, 0.528],
      rotation: 0.42,
      target: [0, 0.8, 0],
    },
  },
  {
    id: "haptics",
    label: "Haptic Feedback",
    title: "Haptic Feedback",
    body: "A quiet pulse in the handle, designed to pass along information through touch rather than sound.",
    detail: "Wide-band actuator in the upper collar",
    anchor: [0.0, 0.62, 0.036],
    nodeName: "hotspot_haptics",
    focus: {
      camera: [0.212, 0.686, 0.414],
      rotation: 0.5,
      target: [0, 0.62, 0],
    },
  },
  {
    id: "sensors",
    label: "Sensors",
    title: "Sensor Array",
    body: "A forward-facing module intended to read the shape of the path ahead as you walk.",
    detail: "Time-of-flight and inertial sensing",
    anchor: [0.0, 0.548, 0.041],
    nodeName: "hotspot_sensors",
    focus: {
      camera: [0.171, 0.601, 0.334],
      rotation: 0.44,
      target: [0, 0.548, 0],
    },
  },
  {
    id: "detection",
    label: "Intelligent Detection",
    title: "Intelligent Detection",
    body: "On-device processing aims to turn what the sensors pick up into simple, timely cues.",
    detail: "Runs locally, behind the control key",
    anchor: [0.0, 0.444, 0.038],
    nodeName: "hotspot_detection",
    focus: {
      camera: [0.153, 0.492, 0.299],
      rotation: 0.47,
      target: [0, 0.444, 0],
    },
  },
  {
    id: "body",
    label: "Lightweight Body",
    title: "Lightweight Body",
    body: "A tapered aluminium shaft, balanced so the weight sits where the hand expects it to be.",
    detail: "Anodised 7000-series aluminium",
    anchor: [0.0, -0.1, 0.034],
    nodeName: "hotspot_body",
    focus: {
      camera: [0.756, 0.005, 0.725],
      rotation: 0.8,
      target: [0, -0.1, 0],
    },
  },
  {
    id: "battery",
    label: "Battery",
    title: "All-day Battery",
    body: "Built for days of ordinary use, then topped up on a magnetic dock at the collar.",
    detail: "Sealed cell, service port in the base",
    anchor: [0.0, -0.895, 0.038],
    nodeName: "hotspot_battery",
    focus: {
      camera: [0.162, -0.845, 0.317],
      rotation: 0.4,
      target: [0, -0.895, 0],
    },
  },
] as const;

export const FEATURE_IDS = PRODUCT_FEATURES.map((feature) => feature.id);

export function getFeature(id: string | null): ProductFeature | null {
  if (!id) return null;
  return PRODUCT_FEATURES.find((feature) => feature.id === id) ?? null;
}

/** Technology section — concept-level claims only. */
export type TechnologyCard = {
  id: string;
  title: string;
  body: string;
};

export const TECHNOLOGY_CARDS: readonly TechnologyCard[] = [
  {
    id: "detection",
    title: "Intelligent Detection",
    body: "Technology designed to help users become more aware of their surroundings.",
  },
  {
    id: "haptics",
    title: "Haptic Feedback",
    body: "Subtle physical feedback designed to communicate information naturally.",
  },
  {
    id: "connected",
    title: "Connected Intelligence",
    body: "A foundation for future connected mobility experiences.",
  },
  {
    id: "everyday",
    title: "Everyday Design",
    body: "Technology integrated into a familiar, lightweight form.",
  },
] as const;
