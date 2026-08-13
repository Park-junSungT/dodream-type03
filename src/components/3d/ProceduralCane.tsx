"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { QualityProfile } from "@/lib/quality";
import { useCaneMaterials } from "./useCaneMaterials";

/**
 * The DoDream smart cane.
 *
 * Modelled from the three-view product reference at
 * `public/references/smart-cane-model-ref.png`. Every dimension below was
 * measured off that image and expressed in *cane space*: tip at y = -1, crown
 * of the cap at y = +1, body on the y axis, sensor face toward +z. The
 * measured slenderness — roughly 31:1 length to diameter — is the defining
 * characteristic of the product, so it is preserved exactly rather than
 * thickened for legibility.
 *
 * `SmartCaneModel` normalises a real GLB into the same space, so this can be
 * swapped out without anything else in the site noticing.
 *
 * Everything is turned or swept from primitives: no meshes to download, and
 * the whole product costs a handful of draw calls.
 */

// --- Radii (measured: body diameter is 3.27% of overall length) ----------
const BODY_R = 0.0327;
const GRIP_R = 0.0345;
const CAP_R = 0.0362;
const LOWER_R = 0.0352;
const TIP_R = 0.0345;

// --- Vertical landmarks, top to bottom -----------------------------------
const CAP_TOP = 1.0;
const CAP_SHOULDER = 0.982;
const CAP_BASE = 0.9425;
const GRIP_BASE = 0.654;
const MODULE_TOP = 0.604;
const CAMERA_Y = 0.548;
const MIC_Y = 0.492;
const BUTTON_Y = 0.444;
const MODULE_BASE = 0.36;
const LOWER_TOP = -0.822;
const SLOT_Y = -0.895;
const LOWER_BASE = -0.9425;
const SEAM_BASE = -0.952;
const TIP_SHOULDER = -0.968;
const TIP_BASE = -1.0;

/** Half-angle of the raised sensor pad, centred on the +z face. */
const PAD_ARC = 2.05;
const PAD_R = BODY_R + 0.0015;

const HALF_PI = Math.PI / 2;

/**
 * The wrist strap: a long, narrow cord loop hanging off the back of the neck,
 * just under the cap, as shown in the rear view.
 */
const STRAP_PATH: [number, number, number][] = [
  [0.006, 0.921, -0.024],
  [0.012, 0.858, -0.045],
  [0.016, 0.72, -0.063],
  [0.017, 0.575, -0.076],
  [0.013, 0.437, -0.082],
  [0.004, 0.356, -0.077],
  [-0.006, 0.339, -0.063],
  [-0.012, 0.404, -0.05],
  [-0.013, 0.558, -0.043],
  [-0.009, 0.72, -0.037],
  [-0.004, 0.862, -0.03],
  [0.0, 0.918, -0.022],
];

/** Quarter-ellipse profile points, used for the domed cap and tip. */
function domeProfile(
  radius: number,
  height: number,
  baseY: number,
  direction: 1 | -1,
  segments: number,
): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = (i / segments) * HALF_PI;
    points.push(
      new THREE.Vector2(radius * Math.cos(t), baseY + direction * height * Math.sin(t)),
    );
  }
  return points;
}

export function ProceduralCane({ quality }: { quality: QualityProfile }) {
  const materials = useCaneMaterials(quality);
  const { radialSegments, curveSegments } = quality;

  const geometry = useMemo(() => {
    const lathePoints = Math.max(6, Math.round(radialSegments / 4));

    // --- Cap: short cylinder under a shallow dome ------------------------
    const capProfile: THREE.Vector2[] = [
      new THREE.Vector2(GRIP_R, CAP_BASE),
      new THREE.Vector2(CAP_R, CAP_BASE + 0.004),
      new THREE.Vector2(CAP_R, CAP_SHOULDER),
      ...domeProfile(CAP_R, CAP_TOP - CAP_SHOULDER, CAP_SHOULDER, 1, lathePoints).slice(1),
    ];

    /*
     * Main body: one lathe from the base of the grip to the seam above the
     * tip, carrying the soft step in at the grip and the step out to the
     * lower module. Turning it as a single silhouette avoids the seams a
     * stack of cylinders would leave down a body this slender.
     */
    const bodyProfile: THREE.Vector2[] = [
      new THREE.Vector2(GRIP_R, SEAM_BASE),
      new THREE.Vector2(LOWER_R, SEAM_BASE + 0.006),
      new THREE.Vector2(LOWER_R, LOWER_BASE),
      new THREE.Vector2(LOWER_R, LOWER_TOP),
      new THREE.Vector2(BODY_R - 0.0018, LOWER_TOP + 0.008),
      new THREE.Vector2(BODY_R, LOWER_TOP + 0.02),
      new THREE.Vector2(BODY_R, GRIP_BASE - 0.009),
      new THREE.Vector2(GRIP_R, GRIP_BASE),
    ];

    // --- Tip: cylinder into a hemispherical dome -------------------------
    const tipProfile: THREE.Vector2[] = [
      ...domeProfile(TIP_R, TIP_SHOULDER - TIP_BASE, TIP_SHOULDER, -1, lathePoints)
        .slice()
        .reverse(),
      new THREE.Vector2(TIP_R, SEAM_BASE),
    ];

    const strapCurve = new THREE.CatmullRomCurve3(
      STRAP_PATH.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      "catmullrom",
      0.5,
    );

    return {
      cap: new THREE.LatheGeometry(capProfile, radialSegments),
      capSeam: new THREE.CylinderGeometry(
        GRIP_R + 0.0006,
        GRIP_R + 0.0006,
        0.003,
        radialSegments,
        1,
        true,
      ),
      grip: new THREE.CylinderGeometry(
        GRIP_R,
        GRIP_R,
        CAP_BASE - GRIP_BASE,
        radialSegments,
        1,
        true,
      ),
      body: new THREE.LatheGeometry(bodyProfile, radialSegments),
      tip: new THREE.LatheGeometry(tipProfile, radialSegments),
      seam: new THREE.CylinderGeometry(
        LOWER_R + 0.0004,
        TIP_R + 0.0004,
        LOWER_BASE - SEAM_BASE,
        radialSegments,
        1,
        true,
      ),

      // Raised pad carrying the sensor and the control, hugging the front.
      pad: new THREE.CylinderGeometry(
        PAD_R,
        PAD_R,
        MODULE_TOP - MODULE_BASE,
        Math.max(10, Math.round(radialSegments / 2)),
        1,
        true,
        -PAD_ARC / 2,
        PAD_ARC,
      ),

      lensBezel: new THREE.CylinderGeometry(0.0264, 0.0252, 0.0042, radialSegments),
      lensGlass: new THREE.SphereGeometry(
        0.0202,
        radialSegments,
        Math.max(6, Math.round(radialSegments / 3)),
        0,
        Math.PI * 2,
        0,
        HALF_PI,
      ),
      mic: new THREE.SphereGeometry(0.0038, 10, 8),
      buttonWell: new THREE.CylinderGeometry(0.0194, 0.0186, 0.004, radialSegments),
      button: new THREE.CylinderGeometry(0.0148, 0.0148, 0.0042, radialSegments),
      buttonRing: new THREE.TorusGeometry(
        0.0196,
        0.0009,
        6,
        Math.max(28, radialSegments),
      ),
      buttonGlyph: new THREE.TorusGeometry(
        0.0072,
        0.0011,
        8,
        Math.max(28, radialSegments),
      ),

      // Charge/service port on the front of the lower module.
      slot: new THREE.CapsuleGeometry(
        0.014,
        0.0395,
        3,
        Math.max(8, Math.round(radialSegments / 3)),
      ),

      strap: new THREE.TubeGeometry(
        strapCurve,
        Math.max(48, curveSegments),
        0.0042,
        Math.max(5, Math.round(radialSegments / 5)),
        false,
      ),
    };
  }, [radialSegments, curveSegments]);

  useEffect(() => {
    return () => {
      Object.values(geometry).forEach((value) => {
        if (value instanceof THREE.BufferGeometry) value.dispose();
      });
    };
  }, [geometry]);

  // Details sit just proud of the pad so they read as fitted, not floating.
  const padFace = PAD_R + 0.0012;

  return (
    <group name="dodream-cane-procedural">
      {/* UpperGrip — brushed cap over the textured grip ------------------ */}
      <group name="UpperGrip">
        <mesh geometry={geometry.cap} material={materials.metal} castShadow />
        <mesh
          geometry={geometry.capSeam}
          material={materials.recess}
          position={[0, CAP_BASE - 0.0015, 0]}
        />
        <mesh
          geometry={geometry.grip}
          material={materials.grip}
          position={[0, (CAP_BASE + GRIP_BASE) / 2, 0]}
          castShadow
          receiveShadow
        />
      </group>

      {/* MainBody -------------------------------------------------------- */}
      <group name="MainBody">
        <mesh
          geometry={geometry.body}
          material={materials.shell}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={geometry.pad}
          material={materials.shell}
          position={[0, (MODULE_TOP + MODULE_BASE) / 2, 0]}
          castShadow
        />
      </group>

      {/* FrontSensor — bezelled camera and microphone --------------------- */}
      <group name="FrontSensor" position={[0, CAMERA_Y, 0]}>
        <mesh
          geometry={geometry.lensBezel}
          material={materials.metal}
          position={[0, 0, padFace - 0.0016]}
          rotation={[HALF_PI, 0, 0]}
          castShadow
        />
        <mesh
          geometry={geometry.lensGlass}
          material={materials.lens}
          position={[0, 0, padFace]}
          rotation={[HALF_PI, 0, 0]}
          scale={[1, 0.28, 1]}
        />
        <mesh
          geometry={geometry.mic}
          material={materials.dark}
          position={[0, MIC_Y - CAMERA_Y, padFace - 0.0022]}
        />
      </group>

      {/* FrontControl — recessed well with the power key ------------------ */}
      <group name="FrontControl" position={[0, BUTTON_Y, 0]}>
        <mesh
          geometry={geometry.buttonWell}
          material={materials.recess}
          position={[0, 0, padFace - 0.0036]}
          rotation={[HALF_PI, 0, 0]}
        />
        <mesh
          geometry={geometry.button}
          material={materials.shell}
          position={[0, 0, padFace - 0.0022]}
          rotation={[HALF_PI, 0, 0]}
        />
        <mesh
          geometry={geometry.buttonRing}
          material={materials.metalTip}
          position={[0, 0, padFace - 0.0026]}
        />
        <mesh
          geometry={geometry.buttonGlyph}
          material={materials.dark}
          position={[0, 0, padFace - 0.0004]}
        />
      </group>

      {/* LowerModule — stepped section with the port slot ----------------- */}
      <group name="LowerModule">
        <mesh
          geometry={geometry.slot}
          material={materials.dark}
          position={[0, SLOT_Y, LOWER_R - 0.001]}
          scale={[1, 1, 0.34]}
        />
        <mesh
          geometry={geometry.seam}
          material={materials.dark}
          position={[0, (LOWER_BASE + SEAM_BASE) / 2, 0]}
        />
      </group>

      {/* BottomTip ------------------------------------------------------- */}
      <group name="BottomTip">
        <mesh geometry={geometry.tip} material={materials.metalTip} castShadow />
      </group>

      {/*
        WristStrap — swung round to hang off the rear quarter rather than
        straight back, so it stays visible (and legible as a lanyard) in the
        three-quarter views the story actually uses.
      */}
      <group name="WristStrap" rotation={[0, 0.85, 0]}>
        <mesh geometry={geometry.strap} material={materials.strap} castShadow />
      </group>
    </group>
  );
}
