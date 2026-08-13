import { PRODUCT_FEATURES, type Vec3 } from "./features";

/**
 * Live hotspot anchor positions in cane space.
 *
 * Seeded from `lib/features.ts`. When a supplied GLB contains empties named
 * after each feature's `nodeName`, `SmartCaneModel` overwrites the entries
 * here so the markers follow the real geometry. Hotspot markers read this map
 * every frame, so an override lands without a React re-render.
 */
export const featureAnchors: Record<string, Vec3> = Object.fromEntries(
  PRODUCT_FEATURES.map((feature) => [feature.id, [...feature.anchor] as Vec3]),
);

export function setFeatureAnchor(id: string, position: Vec3) {
  const anchor = featureAnchors[id];
  if (!anchor) return;
  anchor[0] = position[0];
  anchor[1] = position[1];
  anchor[2] = position[2];
}

export function resetFeatureAnchors() {
  PRODUCT_FEATURES.forEach((feature) => setFeatureAnchor(feature.id, feature.anchor));
}
