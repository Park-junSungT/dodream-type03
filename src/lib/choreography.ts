import type { LayoutMode } from "./quality";
import type { Vec3 } from "./features";

/**
 * Camera and product choreography.
 *
 * Poses are placed on a continuous *chapter axis*: `at: 2.4` means "40% of the
 * way through chapter 03". `ScrollDriver` maps scroll position onto that axis
 * using the real measured section geometry, so the choreography stays in sync
 * no matter how tall a section ends up on a given device.
 *
 * Repeating a pose at two consecutive `at` values holds the shot — useful
 * where the reader needs a stable frame to read or to tap a hotspot.
 */

export type Pose = {
  /** Camera position in world space. */
  camera: Vec3;
  /** Camera look-at point. */
  target: Vec3;
  /** Product position in world space. */
  position: Vec3;
  /** Product yaw, radians. */
  rotation: number;
  /** Product lean toward the viewer, radians. */
  tilt: number;
  scale: number;
  /** Idle rotation speed, radians per second. */
  spin: number;
  /** How much of the pointer/drag parallax applies here, 0–1. */
  responsiveness: number;
};

type Keyframe = {
  at: number;
  desktop: Pose;
  tablet?: Partial<Pose>;
  mobile?: Partial<Pose>;
};

const KEYFRAMES: Keyframe[] = [
  // 01 — Hero. The product stands beside the headline, gently alive.
  // On phones it is cropped at the handle: a large, tactile detail beats a
  // full silhouette shrunk to nothing.
  {
    at: 0,
    desktop: {
      camera: [0, 0.05, 4.5],
      target: [0, -0.02, 0],
      position: [1.05, -0.05, 0],
      // Yaw presents the sensor face to a camera sitting left of the product.
      rotation: 0.22,
      tilt: 0.14,
      scale: 1,
      spin: 0.055,
      responsiveness: 1,
    },
    tablet: { camera: [0, 0.02, 5.4], position: [0.7, -0.05, 0], scale: 0.95 },
    mobile: {
      camera: [0, 0, 4.4],
      target: [0, 0, 0],
      position: [0.16, -1.2, 0],
      rotation: 0.12,
      tilt: 0.12,
      scale: 0.98,
    },
  },
  {
    at: 0.72,
    desktop: {
      camera: [0, 0.02, 4.3],
      target: [0, 0, 0],
      position: [0.72, 0, 0],
      rotation: 0.3,
      tilt: 0.08,
      scale: 1.02,
      spin: 0.055,
      responsiveness: 0.9,
    },
    tablet: { camera: [0, 0.02, 5.2], position: [0.45, -0.02, 0], scale: 0.95 },
    mobile: { camera: [0, 0, 4.6], position: [0.1, -0.95, 0], scale: 0.98 },
  },

  // 02 — Product reveal. Centred and whole, then the camera walks in on the
  // handle, where the intelligence actually lives.
  {
    at: 1,
    desktop: {
      camera: [0, 0, 4.2],
      target: [0, 0, 0],
      position: [0, 0, 0],
      rotation: 0.2,
      tilt: 0.04,
      scale: 1.05,
      spin: 0.05,
      responsiveness: 0.85,
    },
    tablet: { camera: [0, 0, 5.2] },
    mobile: { camera: [0, -0.02, 5.1], position: [0, -0.12, 0], scale: 1 },
  },
  {
    at: 1.55,
    desktop: {
      camera: [0.588, 0.968, 1.26],
      target: [0, 0.8, 0],
      position: [0, 0, 0],
      rotation: 0.1,
      tilt: 0.02,
      scale: 1.06,
      spin: 0.03,
      responsiveness: 0.6,
    },
    tablet: { camera: [0.62, 0.98, 1.48] },
    mobile: { camera: [0.55, 1.0, 1.7], target: [0, 0.8, 0], scale: 1 },
  },

  // 03 — Exploration. A stable three-quarter shot the hotspots can live on.
  {
    at: 1.9,
    desktop: {
      camera: [0.78, 0.08, 4.3],
      target: [-0.3, 0, 0],
      position: [-0.42, 0, 0],
      rotation: 0.52,
      tilt: 0,
      scale: 1.08,
      spin: 0.014,
      responsiveness: 0.55,
    },
    tablet: {
      camera: [0.26, 0.3, 5.9],
      target: [0, 0.28, 0],
      position: [0, 0.4, 0],
      scale: 0.9,
    },
    mobile: {
      camera: [0.26, 0.3, 6],
      target: [0, 0.28, 0],
      position: [0, 0.42, 0],
      scale: 0.86,
    },
  },
  {
    at: 2.45,
    desktop: {
      camera: [0.78, 0.08, 4.3],
      target: [-0.3, 0, 0],
      position: [-0.42, 0, 0],
      rotation: 0.52,
      tilt: 0,
      scale: 1.08,
      spin: 0.014,
      responsiveness: 0.55,
    },
    tablet: {
      camera: [0.26, 0.3, 5.9],
      target: [0, 0.28, 0],
      position: [0, 0.4, 0],
      scale: 0.9,
    },
    mobile: {
      camera: [0.26, 0.3, 6],
      target: [0, 0.28, 0],
      position: [0, 0.42, 0],
      scale: 0.86,
    },
  },

  // 04 — Technology. The product steps back and to one side; the writing leads.
  {
    at: 3,
    desktop: {
      camera: [0, 0.06, 4.9],
      target: [0, 0, 0],
      position: [1.45, -0.06, -0.6],
      rotation: -0.42,
      tilt: 0.1,
      scale: 1,
      spin: 0.05,
      responsiveness: 0.6,
    },
    tablet: { camera: [0, 0.06, 6.2], position: [0.9, -0.1, -0.9], scale: 0.9 },
    mobile: {
      camera: [0, 0.04, 7],
      position: [0.42, -0.05, -1.5],
      scale: 0.82,
    },
  },
  {
    at: 3.7,
    desktop: {
      camera: [0, 0.06, 5],
      target: [0, 0, 0],
      position: [1.4, 0.02, -0.6],
      rotation: -1.15,
      tilt: 0.08,
      scale: 1,
      spin: 0.05,
      responsiveness: 0.6,
    },
    tablet: { camera: [0, 0.06, 6.3], position: [0.86, 0, -0.9], scale: 0.9 },
    mobile: { camera: [0, 0.04, 7.1], position: [0.4, 0.02, -1.5], scale: 0.82 },
  },

  // 05 — Vision. Wide, quiet, centred, slowly turning.
  {
    at: 4,
    desktop: {
      camera: [0, 0.04, 5],
      target: [0, 0, 0],
      position: [0, -0.02, 0],
      rotation: -1.55,
      tilt: 0.05,
      scale: 1,
      spin: 0.075,
      responsiveness: 0.8,
    },
    tablet: { camera: [0, 0.02, 6.2], position: [0, -0.02, 0], scale: 0.9 },
    mobile: { camera: [0, 0, 5.9], position: [0, -0.05, 0], scale: 0.88 },
  },
  {
    at: 4.7,
    desktop: {
      camera: [0, 0.08, 5.3],
      target: [0, 0.05, 0],
      position: [0, 0.08, 0],
      rotation: -2.35,
      tilt: 0.03,
      scale: 0.98,
      spin: 0.075,
      responsiveness: 0.8,
    },
    tablet: { camera: [0, 0.06, 6.4], position: [0, 0.04, 0], scale: 0.88 },
    mobile: { camera: [0, 0.02, 6.1], position: [0, 0.02, 0], scale: 0.86 },
  },

  // 06 — Waitlist. The product lifts out of frame and the invitation gets the
  // whole room; only the tip stays in shot.
  {
    at: 5,
    desktop: {
      camera: [0, 0.3, 5.8],
      target: [0, 0.25, 0],
      position: [0, 2.5, -0.8],
      rotation: -2.9,
      tilt: 0.14,
      scale: 0.9,
      spin: 0.05,
      responsiveness: 0.5,
    },
    tablet: { camera: [0, 0.3, 6.4], position: [0, 2.8, -0.85], scale: 0.88 },
    mobile: { camera: [0, 0.3, 6.6], position: [0, 2.9, -0.9], scale: 0.85 },
  },
];

export type ResolvedTimeline = { at: number; pose: Pose }[];

function mergePose(base: Pose, override?: Partial<Pose>): Pose {
  if (!override) return base;
  return { ...base, ...override };
}

const TIMELINES: Record<LayoutMode, ResolvedTimeline> = {
  desktop: KEYFRAMES.map((frame) => ({ at: frame.at, pose: frame.desktop })),
  tablet: KEYFRAMES.map((frame) => ({
    at: frame.at,
    pose: mergePose(frame.desktop, frame.tablet),
  })),
  mobile: KEYFRAMES.map((frame) => ({
    at: frame.at,
    // Tablet values act as the intermediate step so mobile only overrides
    // what genuinely differs.
    pose: mergePose(mergePose(frame.desktop, frame.tablet), frame.mobile),
  })),
};

export function getTimeline(layout: LayoutMode): ResolvedTimeline {
  return TIMELINES[layout];
}

/** Smoothstep — no overshoot, no bounce, physically believable. */
function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec(a: Vec3, b: Vec3, t: number, out: Vec3): Vec3 {
  out[0] = lerp(a[0], b[0], t);
  out[1] = lerp(a[1], b[1], t);
  out[2] = lerp(a[2], b[2], t);
  return out;
}

/**
 * Samples the timeline at a position on the chapter axis, writing into `out`
 * so the render loop stays allocation-free.
 */
export function samplePose(
  timeline: ResolvedTimeline,
  at: number,
  out: Pose,
): Pose {
  const first = timeline[0];
  const last = timeline[timeline.length - 1];

  if (at <= first.at) return copyPose(first.pose, out);
  if (at >= last.at) return copyPose(last.pose, out);

  let index = 0;
  for (let i = 0; i < timeline.length - 1; i += 1) {
    if (at >= timeline[i].at && at <= timeline[i + 1].at) {
      index = i;
      break;
    }
  }

  const a = timeline[index];
  const b = timeline[index + 1];
  const span = b.at - a.at;
  const t = span <= 0 ? 0 : smooth((at - a.at) / span);

  lerpVec(a.pose.camera, b.pose.camera, t, out.camera);
  lerpVec(a.pose.target, b.pose.target, t, out.target);
  lerpVec(a.pose.position, b.pose.position, t, out.position);
  out.rotation = lerp(a.pose.rotation, b.pose.rotation, t);
  out.tilt = lerp(a.pose.tilt, b.pose.tilt, t);
  out.scale = lerp(a.pose.scale, b.pose.scale, t);
  out.spin = lerp(a.pose.spin, b.pose.spin, t);
  out.responsiveness = lerp(a.pose.responsiveness, b.pose.responsiveness, t);
  return out;
}

export function createPose(): Pose {
  return {
    camera: [0, 0, 4.35],
    target: [0, 0, 0],
    position: [0, 0, 0],
    rotation: 0,
    tilt: 0,
    scale: 1,
    spin: 0,
    responsiveness: 1,
  };
}

export function copyPose(from: Pose, out: Pose): Pose {
  out.camera[0] = from.camera[0];
  out.camera[1] = from.camera[1];
  out.camera[2] = from.camera[2];
  out.target[0] = from.target[0];
  out.target[1] = from.target[1];
  out.target[2] = from.target[2];
  out.position[0] = from.position[0];
  out.position[1] = from.position[1];
  out.position[2] = from.position[2];
  out.rotation = from.rotation;
  out.tilt = from.tilt;
  out.scale = from.scale;
  out.spin = from.spin;
  out.responsiveness = from.responsiveness;
  return out;
}

/** Distance multiplier applied to a focused hotspot camera per layout. */
export const FOCUS_DISTANCE: Record<LayoutMode, number> = {
  desktop: 1.3,
  tablet: 1.45,
  mobile: 1.65,
};

/**
 * Lateral offset applied while a hotspot is focused, so the product sits clear
 * of the information panel (beside it on wide screens, above it on phones).
 */
export const FOCUS_OFFSET: Record<LayoutMode, Vec3> = {
  desktop: [-0.34, 0, 0],
  // Tablet and mobile both dock the panel below the product, so the component
  // being read has to lift clear of it rather than step aside.
  tablet: [0, 0.3, 0],
  mobile: [0, 0.3, 0],
};
