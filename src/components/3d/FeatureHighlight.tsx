"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { featureAnchors } from "@/lib/anchors";
import { motion, useExperience } from "@/lib/experience-store";

/**
 * The in-scene response to selecting a hotspot: a soft ring drawn around the
 * component and a small local light that lifts it out of the body.
 *
 * Both live permanently in the scene at zero strength, so selecting a feature
 * never triggers a shader recompile mid-interaction.
 */
export function FeatureHighlight({ reducedMotion }: { reducedMotion: boolean }) {
  const activeFeature = useExperience((state) => state.activeFeature);
  const activeRef = useRef<string | null>(null);

  useEffect(() => {
    activeRef.current = activeFeature;
  }, [activeFeature]);

  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const id = activeRef.current;
    const strength = id ? motion.focusWeight : 0;

    if (groupRef.current && id) {
      const anchor = featureAnchors[id];
      if (anchor) {
        // Sit just proud of the surface so the ring reads as printed on it.
        groupRef.current.position.set(anchor[0], anchor[1], anchor[2] + 0.03);
      }
    }

    const pulse = reducedMotion
      ? 1
      : 1 + Math.sin(state.clock.elapsedTime * 2.1) * 0.045;

    if (ringMaterialRef.current) {
      ringMaterialRef.current.opacity = THREE.MathUtils.damp(
        ringMaterialRef.current.opacity,
        strength * 0.72,
        6,
        dt,
      );
    }
    if (glowMaterialRef.current) {
      glowMaterialRef.current.opacity = THREE.MathUtils.damp(
        glowMaterialRef.current.opacity,
        strength * 0.08,
        6,
        dt,
      );
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(
        THREE.MathUtils.lerp(0.7, 1, strength) * pulse,
      );
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(THREE.MathUtils.lerp(0.6, 1.1, strength));
    }
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.damp(
        lightRef.current.intensity,
        strength * 0.4,
        6,
        dt,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef}>
        <circleGeometry args={[0.052, 28]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color="#c78a5c"
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ringRef}>
        <torusGeometry args={[0.052, 0.0028, 8, 36]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color="#e2a171"
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        color="#f0b184"
        intensity={0}
        distance={0.55}
        decay={2}
        position={[0, 0, 0.08]}
      />
    </group>
  );
}
