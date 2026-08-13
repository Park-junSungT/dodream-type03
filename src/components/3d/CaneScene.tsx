"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import {
  degradeTier,
  getQualityProfile,
  type DeviceTier,
} from "@/lib/quality";
import { experience } from "@/lib/experience-store";
import { CaneRig } from "./CaneRig";
import { StudioLighting } from "./StudioLighting";

type Props = {
  tier: DeviceTier;
  reducedMotion: boolean;
  /** DOM node the hotspot markers portal into, above the story copy. */
  hotspotPortal: RefObject<HTMLElement | null>;
};

/**
 * The WebGL stage.
 *
 * Mounted client-side only and sized to the viewport behind the whole page.
 * The canvas itself never receives pointer events — dragging is handled by a
 * dedicated surface underneath it — so scrolling, links and forms always win.
 */
export function CaneScene({ tier, reducedMotion, hotspotPortal }: Props) {
  // Quality is derived, not synchronised: a sustained frame-budget miss sets
  // `degraded` once and the profile follows from the detected tier.
  const [degraded, setDegraded] = useState(false);
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  const activeTier: DeviceTier = degraded ? degradeTier(tier) : tier;
  const quality = getQualityProfile(activeTier);

  // Stop rendering entirely when the tab is in the background.
  useEffect(() => {
    const onVisibility = () => {
      setFrameloop(document.hidden ? "never" : "always");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const handleCreated = useCallback((state: RootState) => {
    state.gl.toneMapping = THREE.ACESFilmicToneMapping;
    state.gl.toneMappingExposure = 1.05;

    const canvas = state.gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      experience.setSceneFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);
  }, []);

  const handleDecline = useCallback(() => {
    setDegraded((current) => {
      if (!current) experience.setTier(degradeTier(tier));
      return true;
    });
  }, [tier]);

  return (
    <Canvas
      dpr={quality.dpr}
      frameloop={frameloop}
      shadows={quality.shadows ? "soft" : false}
      camera={{ fov: 32, near: 0.1, far: 26, position: [0, 0, 4.35] }}
      gl={{
        antialias: quality.antialias,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      performance={{ min: 0.5, max: 1, debounce: 260 }}
      onCreated={handleCreated}
      style={{ pointerEvents: "none", touchAction: "none" }}
    >
      <PerformanceMonitor onDecline={handleDecline}>
        <StudioLighting quality={quality} />
        <CaneRig
          quality={quality}
          reducedMotion={reducedMotion}
          hotspotPortal={hotspotPortal}
        />
      </PerformanceMonitor>
      <AdaptiveDpr />
      <Preload all />
      <ReadySignal />
    </Canvas>
  );
}

/** Reports readiness once real frames are on screen, not merely on GL init. */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 2) return;
    frames.current += 1;
    if (frames.current === 3) experience.setSceneReady(true);
  });
  return null;
}
