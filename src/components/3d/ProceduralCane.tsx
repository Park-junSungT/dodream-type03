"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { QualityProfile } from "@/lib/quality";
import { useCaneMaterials } from "./useCaneMaterials";

/**
 * The placeholder DoDream cane.
 *
 * Built to sit in *cane space*: tip at y = -1, top of the handle at y = +1,
 * shaft on the y axis, sensors facing +z. It is a stand-in for the real
 * industrial design, not a fixture — `SmartCaneModel` swaps a GLB into the
 * same space without any other part of the site noticing.
 *
 * Everything here is turned or extruded from primitives, so the whole product
 * costs a handful of draw calls and no texture memory.
 */

/** Sweep of the swan-neck handle, from the top of the shaft to the grip end. */
const HANDLE_PATH: [number, number, number][] = [
  [0, 0.6, 0],
  [0, 0.74, 0],
  [0.012, 0.87, 0],
  [0.075, 0.945, 0],
  [0.175, 0.965, 0],
  [0.285, 0.945, 0],
  [0.355, 0.9, 0],
];

const SHAFT_TOP = 0.61;
const SHAFT_BOTTOM = -0.9;

export function ProceduralCane({ quality }: { quality: QualityProfile }) {
  const materials = useCaneMaterials(quality);
  const { radialSegments, curveSegments } = quality;

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      HANDLE_PATH.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      "catmullrom",
      0.4,
    );

    // The grip sleeve covers the forward, roughly horizontal run of the neck.
    const gripPoints: THREE.Vector3[] = [];
    const gripStart = 0.46;
    const gripSamples = Math.max(8, Math.round(curveSegments / 4));
    for (let i = 0; i <= gripSamples; i += 1) {
      const t = gripStart + (1 - gripStart) * (i / gripSamples);
      gripPoints.push(curve.getPoint(t));
    }
    const gripCurve = new THREE.CatmullRomCurve3(gripPoints);

    const shaftHeight = SHAFT_TOP - SHAFT_BOTTOM;

    return {
      neck: new THREE.TubeGeometry(
        curve,
        curveSegments,
        0.032,
        Math.max(8, Math.round(radialSegments / 2)),
        false,
      ),
      grip: new THREE.TubeGeometry(
        gripCurve,
        Math.max(12, Math.round(curveSegments / 2)),
        0.045,
        Math.max(8, Math.round(radialSegments / 2)),
        false,
      ),
      gripCap: new THREE.SphereGeometry(
        0.045,
        Math.max(8, Math.round(radialSegments / 2)),
        Math.max(6, Math.round(radialSegments / 3)),
      ),
      shaft: new THREE.CylinderGeometry(
        0.031,
        0.023,
        shaftHeight,
        radialSegments,
        1,
        true,
      ),
      collar: new THREE.CylinderGeometry(0.038, 0.038, 1, radialSegments),
      ferrule: new THREE.CylinderGeometry(0.031, 0.047, 0.055, radialSegments),
      tip: new THREE.CylinderGeometry(0.047, 0.05, 0.04, radialSegments),
      tipCap: new THREE.SphereGeometry(
        0.05,
        radialSegments,
        Math.max(6, Math.round(radialSegments / 3)),
      ),
      led: new THREE.SphereGeometry(0.0075, 10, 8),
      gripEnds: [curve.getPoint(gripStart), curve.getPoint(1)] as const,
    };
  }, [radialSegments, curveSegments]);

  useEffect(() => {
    return () => {
      Object.values(geometry).forEach((value) => {
        if (value instanceof THREE.BufferGeometry) value.dispose();
      });
    };
  }, [geometry]);

  const smoothness = quality.tier === "low" ? 2 : 4;
  const [gripStartPoint, gripEndPoint] = geometry.gripEnds;

  return (
    <group name="dodream-cane-procedural">
      {/* Shaft -------------------------------------------------------- */}
      <mesh
        geometry={geometry.shaft}
        material={materials.shell}
        position={[0, (SHAFT_TOP + SHAFT_BOTTOM) / 2, 0]}
        castShadow
        receiveShadow
      />

      {/* Handle sweep and grip sleeve --------------------------------- */}
      <mesh
        geometry={geometry.neck}
        material={materials.shell}
        castShadow
        receiveShadow
      />
      <mesh geometry={geometry.grip} material={materials.grip} castShadow />
      <mesh
        geometry={geometry.gripCap}
        material={materials.grip}
        position={gripStartPoint}
      />
      <mesh
        geometry={geometry.gripCap}
        material={materials.grip}
        position={gripEndPoint}
      />

      {/* Haptic collar — copper ring below the grip -------------------- */}
      <mesh
        geometry={geometry.collar}
        material={materials.accent}
        position={[0, 0.7, 0]}
        scale={[1, 0.055, 1]}
        castShadow
      />

      {/* Charge collar with status point ------------------------------ */}
      <mesh
        geometry={geometry.collar}
        material={materials.grip}
        position={[0, 0.42, 0]}
        scale={[0.95, 0.075, 0.95]}
        castShadow
      />
      <mesh geometry={geometry.led} material={materials.led} position={[0, 0.42, 0.037]} />

      {/* Forward sensor module ---------------------------------------- */}
      <RoundedBox
        args={[0.062, 0.155, 0.05]}
        radius={0.016}
        smoothness={smoothness}
        position={[0, 0.16, 0.05]}
        material={materials.grip}
        castShadow
      />
      <RoundedBox
        args={[0.04, 0.058, 0.01]}
        radius={0.005}
        smoothness={smoothness}
        position={[0, 0.192, 0.075]}
        material={materials.lens}
      />
      <RoundedBox
        args={[0.026, 0.026, 0.01]}
        radius={0.005}
        smoothness={smoothness}
        position={[0, 0.128, 0.075]}
        material={materials.lens}
      />

      {/* Adjustment seam — the body hotspot lands here ----------------- */}
      <mesh
        geometry={geometry.collar}
        material={materials.shell}
        position={[0, -0.16, 0]}
        scale={[0.82, 0.03, 0.82]}
      />

      {/* Ground-facing sensing window --------------------------------- */}
      <RoundedBox
        args={[0.05, 0.088, 0.034]}
        radius={0.011}
        smoothness={smoothness}
        position={[0, -0.62, 0.04]}
        material={materials.grip}
        castShadow
      />
      <RoundedBox
        args={[0.03, 0.05, 0.008]}
        radius={0.004}
        smoothness={smoothness}
        position={[0, -0.62, 0.06]}
        material={materials.lens}
      />

      {/* Ferrule and rubber tip --------------------------------------- */}
      <mesh
        geometry={geometry.ferrule}
        material={materials.shell}
        position={[0, -0.925, 0]}
        castShadow
      />
      <mesh
        geometry={geometry.tip}
        material={materials.rubber}
        position={[0, -0.972, 0]}
        castShadow
      />
      <mesh
        geometry={geometry.tipCap}
        material={materials.rubber}
        position={[0, -0.985, 0]}
        scale={[1, 0.3, 1]}
      />
    </group>
  );
}
