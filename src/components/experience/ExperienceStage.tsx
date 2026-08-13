"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_TIER,
  detectDeviceTier,
  supportsWebGL,
  type DeviceTier,
} from "@/lib/quality";
import { experience, useExperience } from "@/lib/experience-store";
import { CaneInteraction } from "@/components/3d/CaneInteraction";
import { SceneFallback } from "@/components/3d/SceneFallback";

/**
 * WebGL never runs on the server and never blocks first paint. The stage
 * renders its backdrop immediately; the canvas arrives in a second chunk.
 */
const CaneScene = dynamic(
  () => import("@/components/3d/CaneScene").then((module) => module.CaneScene),
  { ssr: false, loading: () => null },
);

/**
 * The fixed visual stage that sits behind the entire document.
 *
 * Layer order matters, and is the mechanism behind "3D must never break the
 * page":
 *
 *   z-0   backdrop        painted colour, no input
 *   z-0   gesture surface receives only what nothing above wanted
 *   z-10  WebGL canvas    pointer-transparent
 *   z-20  story copy      (rendered by the page, links/buttons opt back in)
 *   z-30  hotspot markers portalled above the copy so they stay clickable
 */
export function ExperienceStage({ reducedMotion }: { reducedMotion: boolean }) {
  const hotspotLayer = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<DeviceTier>(DEFAULT_TIER);
  const [canRender, setCanRender] = useState(false);
  const sceneFailed = useExperience((state) => state.sceneFailed);

  /*
   * Capability probing costs a throwaway WebGL context, so it waits for the
   * first paint. The page is already readable by then; the canvas arrives a
   * frame later.
   */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!supportsWebGL()) {
        experience.setSceneFailed(true);
        return;
      }
      const detected = detectDeviceTier();
      setTier(detected);
      experience.setTier(detected);
      setCanRender(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // If the canvas never reports a frame, release the intro anyway.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      experience.setSceneReady(true);
    }, 4500);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      <div className="stage-backdrop pointer-events-none fixed inset-0 z-0" />

      <CaneInteraction reducedMotion={reducedMotion} />

      <div className="stage-canvas pointer-events-none fixed inset-x-0 top-0 z-10">
        {canRender && !sceneFailed ? (
          <CaneScene
            tier={tier}
            reducedMotion={reducedMotion}
            hotspotPortal={hotspotLayer}
          />
        ) : null}
        {sceneFailed ? <SceneFallback /> : null}
      </div>

      <div className="stage-vignette pointer-events-none fixed inset-0 z-10" />

      <div
        ref={hotspotLayer}
        className="pointer-events-none fixed inset-0 z-30"
        aria-hidden={false}
      />
    </>
  );
}
