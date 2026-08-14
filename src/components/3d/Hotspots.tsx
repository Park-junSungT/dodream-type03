"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { PRODUCT_FEATURES } from "@/lib/features";
import { featureAnchors } from "@/lib/anchors";
import { experience, motion, useExperience } from "@/lib/experience-store";

/**
 * Feature markers pinned to the product.
 *
 * They are real DOM buttons rendered through `drei/Html`, which keeps them
 * keyboard reachable and screen-reader friendly while they track the geometry
 * in 3D. Visibility is driven per-frame from refs — a marker fades out once it
 * rotates around the back of the cane — so orbiting never re-renders React.
 */
export function Hotspots({ portal }: { portal?: RefObject<HTMLElement | null> }) {
  const exploring = useExperience((state) => state.exploring);

  return (
    <>
      {PRODUCT_FEATURES.map((feature, index) => (
        <Hotspot
          key={feature.id}
          id={feature.id}
          label={feature.label}
          index={index}
          exploring={exploring}
          portal={portal}
        />
      ))}
    </>
  );
}

type HotspotProps = {
  id: string;
  label: string;
  index: number;
  exploring: boolean;
  portal?: RefObject<HTMLElement | null>;
};

function createScratch() {
  return {
    world: new THREE.Vector3(),
    outward: new THREE.Vector3(),
    toCamera: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    opacity: 0,
  };
}

function Hotspot({ id, label, index, exploring, portal }: HotspotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const scratchRef = useRef<ReturnType<typeof createScratch> | null>(null);
  const activeFeature = useExperience((state) => state.activeFeature);
  const activeRef = useRef<string | null>(null);
  const exploringRef = useRef(false);

  useEffect(() => {
    activeRef.current = activeFeature;
  }, [activeFeature]);

  useEffect(() => {
    exploringRef.current = exploring;
  }, [exploring]);

  useFrame((state, delta) => {
    const scratch = (scratchRef.current ??= createScratch());
    const group = groupRef.current;
    const element = elementRef.current;
    if (!group || !element) return;

    const anchor = featureAnchors[id];
    if (anchor) group.position.set(anchor[0], anchor[1], anchor[2]);

    // Fade the whole set in around the exploration chapter.
    const axis = motion.chapterAxis;
    const chapterFade =
      THREE.MathUtils.smoothstep(axis, 1.66, 1.92) *
      (1 - THREE.MathUtils.smoothstep(axis, 2.42, 2.6));

    // Hide markers that have rotated to the far side of the product.
    group.getWorldPosition(scratch.world);
    group.getWorldQuaternion(scratch.quaternion);
    const radial = Math.hypot(anchor?.[0] ?? 0, anchor?.[2] ?? 0);
    if (radial < 0.02) scratch.outward.set(0, 0, 1);
    else scratch.outward.set(anchor?.[0] ?? 0, 0, anchor?.[2] ?? 0).normalize();
    scratch.outward.applyQuaternion(scratch.quaternion);
    scratch.toCamera.copy(state.camera.position).sub(scratch.world).normalize();
    const facing = scratch.outward.dot(scratch.toCamera);

    const active = activeRef.current === id;
    const dimmed = activeRef.current !== null && !active;
    const target =
      chapterFade *
      THREE.MathUtils.clamp((facing - 0.02) * 2.6, 0, 1) *
      (dimmed ? 0.2 : 1);

    scratch.opacity = THREE.MathUtils.damp(
      scratch.opacity,
      target,
      10,
      Math.min(delta, 1 / 30),
    );

    element.style.opacity = scratch.opacity.toFixed(3);
    const interactive = exploringRef.current && scratch.opacity > 0.35;
    element.style.pointerEvents = interactive ? "auto" : "none";
    element.style.visibility = scratch.opacity < 0.01 ? "hidden" : "visible";
  });

  const isActive = activeFeature === id;

  return (
    <group ref={groupRef}>
      <Html
        center
        prepend
        // drei types the portal as non-null; it reads `.current` defensively,
        // so an unmounted layer simply falls back to the canvas container.
        portal={portal as RefObject<HTMLElement> | undefined}
        pointerEvents="none"
        zIndexRange={[40, 20]}
        style={{ pointerEvents: "none" }}
      >
        <div ref={elementRef} className="dd-hotspot" style={{ opacity: 0 }}>
          <button
            type="button"
            className="dd-hotspot-button"
            data-active={isActive ? "true" : undefined}
            aria-pressed={isActive}
            aria-label={isActive ? `${label} 닫기` : `${label} 자세히 보기`}
            tabIndex={exploring ? 0 : -1}
            onClick={(event) => {
              event.stopPropagation();
              experience.markInteracted();
              experience.toggleFeature(id);
            }}
          >
            <span className="dd-hotspot-dot" aria-hidden="true" />
            <span className="dd-hotspot-label">
              <span className="dd-hotspot-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              {label}
            </span>
          </button>
        </div>
      </Html>
    </group>
  );
}
