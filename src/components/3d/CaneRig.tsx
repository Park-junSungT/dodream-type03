"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import {
  FOCUS_DISTANCE,
  FOCUS_OFFSET,
  copyPose,
  createPose,
  getTimeline,
  samplePose,
} from "@/lib/choreography";
import { getFeature } from "@/lib/features";
import { featureAnchors } from "@/lib/anchors";
import { motion, useExperience } from "@/lib/experience-store";
import type { QualityProfile } from "@/lib/quality";
import { SmartCaneModel } from "./SmartCaneModel";
import { FeatureHighlight } from "./FeatureHighlight";
import { Hotspots } from "./Hotspots";
import { interpolateMood } from "./StudioLighting";

type Props = {
  quality: QualityProfile;
  reducedMotion: boolean;
  hotspotPortal?: RefObject<HTMLElement | null>;
};

const TWO_PI = Math.PI * 2;

/** Brings `angle` into the same revolution as `reference` before blending. */
function nearestAngle(angle: number, reference: number) {
  return angle + TWO_PI * Math.round((reference - angle) / TWO_PI);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Per-frame working values, allocated once and mutated in place. */
function createScratch() {
  return {
    story: createPose(),
    pose: createPose(),
    camera: new THREE.Vector3(0, 0, 4.35),
    target: new THREE.Vector3(),
    desiredCamera: new THREE.Vector3(),
    desiredTarget: new THREE.Vector3(),
    offset: new THREE.Vector3(),
    focusOffset: new THREE.Vector3(),
    focusTarget: new THREE.Vector3(),
    focusCamera: new THREE.Vector3(),
    spherical: new THREE.Spherical(),
    spin: 0,
    scale: 1,
    position: new THREE.Vector3(),
  };
}

/**
 * Drives the whole 3D story: samples the scroll timeline, folds in pointer,
 * drag and pinch, blends toward a focused hotspot, and damps everything so
 * the camera always moves like it is on a dolly rather than snapping.
 *
 * All continuous input is read from the mutable `motion` object, so scrolling
 * and dragging never trigger a React render.
 */
export function CaneRig({ quality, reducedMotion, hotspotPortal }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Group>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const scratchRef = useRef<ReturnType<typeof createScratch> | null>(null);
  const activeFeature = useExperience((state) => state.activeFeature);
  const activeRef = useRef<string | null>(null);

  useEffect(() => {
    activeRef.current = activeFeature;
  }, [activeFeature]);

  useFrame((state, delta) => {
    const scratch = (scratchRef.current ??= createScratch());
    const dt = Math.min(delta, 1 / 30);
    const time = state.clock.elapsedTime;
    const still = reducedMotion;
    const lambda = still ? 22 : 4.6;
    const group = groupRef.current;

    const timeline = getTimeline(motion.layout);
    samplePose(timeline, motion.chapterAxis, scratch.story);
    const pose = copyPose(scratch.story, scratch.pose);

    // --- Focus blend --------------------------------------------------
    const feature = getFeature(activeRef.current);
    motion.focusWeight = THREE.MathUtils.damp(
      motion.focusWeight,
      feature ? 1 : 0,
      still ? 20 : 3.4,
      dt,
    );
    const focus = easeInOut(THREE.MathUtils.clamp(motion.focusWeight, 0, 1));

    // --- Product transform --------------------------------------------
    if (!still) {
      scratch.spin += pose.spin * dt * (1 - focus);
    }

    /*
     * Parallax is scaled back while a component is focused: the product is
     * slender enough that the focus shots sit under a metre from the camera,
     * where the full pointer shift would swing the detail out of frame.
     */
    const responsiveness = pose.responsiveness * (still ? 0 : 1) * (1 - focus * 0.7);
    let yaw =
      pose.rotation +
      scratch.spin +
      motion.dragYaw +
      motion.pointerX * 0.22 * responsiveness;
    let tilt = pose.tilt;
    scratch.position.set(pose.position[0], pose.position[1], pose.position[2]);
    let scale = pose.scale;

    if (focus > 0.0005 && feature) {
      const offset = FOCUS_OFFSET[motion.layout];
      const focusYaw = nearestAngle(feature.focus.rotation, yaw);
      yaw = THREE.MathUtils.lerp(yaw, focusYaw, focus);
      tilt = THREE.MathUtils.lerp(tilt, 0, focus);
      scale = THREE.MathUtils.lerp(scale, 1.12, focus);
      scratch.position.lerp(
        scratch.focusOffset.set(offset[0], offset[1], offset[2]),
        focus,
      );
    }

    if (group) {
      group.rotation.y = THREE.MathUtils.damp(
        group.rotation.y,
        yaw,
        still ? 22 : 5,
        dt,
      );
      group.rotation.z = THREE.MathUtils.damp(group.rotation.z, tilt, lambda, dt);
      // A barely-there sway keeps the product feeling physical, not pasted on.
      const bob = still ? 0 : Math.sin(time * 0.55) * 0.012 * (1 - focus);
      group.position.x = THREE.MathUtils.damp(
        group.position.x,
        scratch.position.x,
        lambda,
        dt,
      );
      group.position.y = THREE.MathUtils.damp(
        group.position.y,
        scratch.position.y + bob,
        lambda,
        dt,
      );
      group.position.z = THREE.MathUtils.damp(
        group.position.z,
        scratch.position.z,
        lambda,
        dt,
      );
      scratch.scale = THREE.MathUtils.damp(scratch.scale, scale, lambda, dt);
      group.scale.setScalar(scratch.scale);
    }

    // --- Camera --------------------------------------------------------
    scratch.desiredCamera.set(pose.camera[0], pose.camera[1], pose.camera[2]);
    scratch.desiredTarget.set(pose.target[0], pose.target[1], pose.target[2]);

    if (focus > 0.0005 && feature) {
      const anchor = featureAnchors[feature.id] ?? feature.anchor;
      const localTarget = feature.focus.target ?? anchor;
      const cos = Math.cos(yaw);
      const sin = Math.sin(yaw);

      /*
       * Rotate the authored local target into the product's current frame.
       *
       * The product has been pushed by FOCUS_OFFSET but the camera keeps
       * aiming at the un-offset point — which is exactly what lays the
       * component off-centre in frame, clear of the information panel
       * (beside it on wide screens, above it on phones).
       */
      scratch.focusTarget.set(
        localTarget[0] * cos + localTarget[2] * sin,
        localTarget[1],
        -localTarget[0] * sin + localTarget[2] * cos,
      );

      // The authored camera is an offset from that target, scaled per layout.
      const distance = FOCUS_DISTANCE[motion.layout];
      scratch.focusCamera
        .set(
          feature.focus.camera[0] - localTarget[0],
          feature.focus.camera[1] - localTarget[1],
          feature.focus.camera[2] - localTarget[2],
        )
        .multiplyScalar(distance)
        .add(scratch.focusTarget);

      scratch.desiredCamera.lerp(scratch.focusCamera, focus);
      scratch.desiredTarget.lerp(scratch.focusTarget, focus);
    }

    // Wide, short viewports (a phone on its side) need extra breathing room.
    const aspect = state.size.width / Math.max(1, state.size.height);
    if (aspect > 1.85) {
      const fit = Math.min(1.4, Math.pow(aspect / 1.85, 0.6));
      scratch.desiredCamera.sub(scratch.desiredTarget);
      scratch.desiredCamera.multiplyScalar(fit);
      scratch.desiredCamera.add(scratch.desiredTarget);
    }

    // Orbit elevation from vertical drag, plus pinch distance.
    scratch.offset.copy(scratch.desiredCamera).sub(scratch.desiredTarget);
    scratch.spherical.setFromVector3(scratch.offset);
    scratch.spherical.phi = THREE.MathUtils.clamp(
      scratch.spherical.phi - motion.dragPitch,
      0.42,
      2.3,
    );
    scratch.spherical.radius /= THREE.MathUtils.clamp(motion.zoom, 0.7, 1.7);
    scratch.offset.setFromSpherical(scratch.spherical);
    scratch.desiredCamera.copy(scratch.desiredTarget).add(scratch.offset);

    // Pointer parallax — horizontal already turned the product, so the camera
    // only answers with a small shift.
    scratch.desiredCamera.x += motion.pointerX * 0.1 * responsiveness;
    scratch.desiredCamera.y += motion.pointerY * 0.12 * responsiveness;

    scratch.camera.x = THREE.MathUtils.damp(
      scratch.camera.x,
      scratch.desiredCamera.x,
      lambda,
      dt,
    );
    scratch.camera.y = THREE.MathUtils.damp(
      scratch.camera.y,
      scratch.desiredCamera.y,
      lambda,
      dt,
    );
    scratch.camera.z = THREE.MathUtils.damp(
      scratch.camera.z,
      scratch.desiredCamera.z,
      lambda,
      dt,
    );
    scratch.target.x = THREE.MathUtils.damp(
      scratch.target.x,
      scratch.desiredTarget.x,
      lambda,
      dt,
    );
    scratch.target.y = THREE.MathUtils.damp(
      scratch.target.y,
      scratch.desiredTarget.y,
      lambda,
      dt,
    );
    scratch.target.z = THREE.MathUtils.damp(
      scratch.target.z,
      scratch.desiredTarget.z,
      lambda,
      dt,
    );

    state.camera.position.copy(scratch.camera);
    state.camera.lookAt(scratch.target);

    // --- Flick inertia and slow return to rest -------------------------
    if (!motion.dragging && Math.abs(motion.dragVelocity) > 0.0004) {
      motion.dragYaw += motion.dragVelocity * dt;
      motion.dragVelocity *= Math.exp(-3.2 * dt);
    } else if (!motion.dragging) {
      motion.dragVelocity = 0;
    }
    // Outside the exploration chapter the product drifts back to the
    // choreographed angle, so the story always recomposes itself.
    const inspecting = motion.chapterAxis > 1.72 && motion.chapterAxis < 2.55;
    if (!motion.dragging && !inspecting) {
      motion.dragYaw = THREE.MathUtils.damp(motion.dragYaw, 0, 0.5, dt);
      motion.dragPitch = THREE.MathUtils.damp(motion.dragPitch, 0, 0.8, dt);
      motion.zoom = THREE.MathUtils.damp(motion.zoom, 1, 0.8, dt);
    }

    // --- Ground shadow follows the product -----------------------------
    if (shadowRef.current && group) {
      shadowRef.current.position.x = group.position.x;
      shadowRef.current.position.z = group.position.z;
      shadowRef.current.position.y = -1.02 * scratch.scale + group.position.y;

      if (!shadowMeshRef.current) {
        shadowMeshRef.current =
          (shadowRef.current.getObjectByProperty("isMesh", true) as THREE.Mesh) ??
          null;
      }
      const material = shadowMeshRef.current?.material;
      if (material && !Array.isArray(material)) {
        const mood = interpolateMood(motion.chapterAxis);
        material.opacity = THREE.MathUtils.damp(
          material.opacity,
          mood.contact,
          4,
          dt,
        );
      }
    }
  });

  return (
    <>
      <group ref={groupRef} name="dodream-cane">
        <SmartCaneModel quality={quality} />
        <FeatureHighlight reducedMotion={reducedMotion} />
        <Hotspots portal={hotspotPortal} />
      </group>

      {quality.contactShadows ? (
        <group ref={shadowRef}>
          <ContactShadows
            position={[0, 0, 0]}
            scale={3.2}
            blur={quality.contactShadowBlur}
            resolution={quality.contactShadowResolution}
            far={1.8}
            opacity={0.5}
            color="#171310"
            frames={Infinity}
          />
        </group>
      ) : null}
    </>
  );
}
