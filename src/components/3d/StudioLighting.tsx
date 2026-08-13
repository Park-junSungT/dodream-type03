"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CHAPTERS } from "@/lib/story";
import { motion } from "@/lib/experience-store";
import type { QualityProfile } from "@/lib/quality";

/**
 * A soft-box studio built entirely in-scene.
 *
 * Using `Lightformer` panels instead of a downloaded HDRI keeps reflections
 * self-hosted (no runtime CDN fetch, nothing to wait for) and lets the
 * reflections read as a real product shoot. The environment is baked once;
 * the mood of each chapter is applied by animating light intensities rather
 * than re-rendering the cube map.
 */
export function StudioLighting({ quality }: { quality: QualityProfile }) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.HemisphereLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const mood = interpolateMood(motion.chapterAxis);

    if (keyRef.current) {
      keyRef.current.intensity = THREE.MathUtils.damp(
        keyRef.current.intensity,
        mood.key * 2.1,
        4,
        dt,
      );
    }
    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.damp(
        fillRef.current.intensity,
        mood.fill * 0.9,
        4,
        dt,
      );
    }
    if (rimRef.current) {
      rimRef.current.intensity = THREE.MathUtils.damp(
        rimRef.current.intensity,
        mood.key * 1.1,
        4,
        dt,
      );
    }

    state.scene.environmentIntensity = THREE.MathUtils.damp(
      state.scene.environmentIntensity ?? 1,
      mood.env,
      4,
      dt,
    );
  });

  return (
    <>
      <hemisphereLight
        ref={fillRef}
        args={["#ffffff", "#8f8a82", 0.85]}
        position={[0, 1, 0]}
      />
      <directionalLight
        ref={keyRef}
        position={[3.4, 5.2, 4.2]}
        intensity={2.1}
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-near={1}
        shadow-camera-far={14}
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={2.4}
        shadow-camera-bottom={-2.4}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
      />
      <directionalLight
        ref={rimRef}
        position={[-4.5, 2.4, -3.6]}
        intensity={1.1}
        color="#cfd7e2"
      />

      <Environment resolution={quality.envResolution} frames={1}>
        {/* Overhead soft box — the long specular running down the shaft. */}
        <Lightformer
          form="rect"
          intensity={3.2}
          position={[0, 6, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[9, 9, 1]}
          color="#ffffff"
        />
        {/* Key panel, camera right. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[4.2, 1.6, 3.4]}
          rotation={[0, -Math.PI / 3.4, 0]}
          scale={[3.2, 7, 1]}
          color="#fff6ee"
        />
        {/* Cool rim, camera left and behind — separates product from ground. */}
        <Lightformer
          form="rect"
          intensity={2.1}
          position={[-4.6, 1.2, -2.8]}
          rotation={[0, Math.PI / 2.6, 0]}
          scale={[3.4, 7, 1]}
          color="#dfe7f2"
        />
        {/* Low bounce so the underside never goes flat black. */}
        <Lightformer
          form="rect"
          intensity={0.75}
          position={[0, -3.2, 3.2]}
          rotation={[-Math.PI / 2.4, 0, 0]}
          scale={[7, 3, 1]}
          color="#e8e2d8"
        />
        {/* A single warm strip — the copper accents pick this up. */}
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[1.4, 2.6, -3.4]}
          rotation={[0, Math.PI / 6, 0]}
          scale={[1.2, 4, 1]}
          color="#f0c49a"
        />
      </Environment>
    </>
  );
}

type Mood = { key: number; fill: number; env: number; contact: number };

const moodResult: Mood = { key: 1, fill: 1, env: 1, contact: 1 };

/** Blends the lighting mood of the two chapters either side of the playhead. */
export function interpolateMood(axis: number): Mood {
  const clamped = THREE.MathUtils.clamp(axis, 0, CHAPTERS.length - 1);
  const lower = Math.floor(clamped);
  const upper = Math.min(CHAPTERS.length - 1, lower + 1);
  // Matches the ground curve in StageDriver, so the product is always lit for
  // the room the page is actually showing.
  const t = THREE.MathUtils.smoothstep(clamped - lower, 0.25, 0.75);
  const a = CHAPTERS[lower].mood.light;
  const b = CHAPTERS[upper].mood.light;

  moodResult.key = THREE.MathUtils.lerp(a.key, b.key, t);
  moodResult.fill = THREE.MathUtils.lerp(a.fill, b.fill, t);
  moodResult.env = THREE.MathUtils.lerp(a.env, b.env, t);
  moodResult.contact = THREE.MathUtils.lerp(a.contact, b.contact, t);
  return moodResult;
}
