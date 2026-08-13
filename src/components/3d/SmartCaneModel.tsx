"use client";

import { Component, Suspense, useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import {
  CANE_HEIGHT,
  CANE_MODEL_URL,
  GLB_ADJUST,
  USE_GLB_MODEL,
} from "@/lib/model-config";
import { PRODUCT_FEATURES, type Vec3 } from "@/lib/features";
import { resetFeatureAnchors, setFeatureAnchor } from "@/lib/anchors";
import type { QualityProfile } from "@/lib/quality";
import { ProceduralCane } from "./ProceduralCane";

/**
 * The single entry point for the DoDream product geometry.
 *
 * Renders the real GLB when one is configured (see `lib/model-config.ts`) and
 * the procedural placeholder otherwise. Either way the result is normalised
 * into cane space, so the camera choreography and hotspot anchors are written
 * once and survive the swap.
 */
export function SmartCaneModel({ quality }: { quality: QualityProfile }) {
  if (!USE_GLB_MODEL) {
    return <ProceduralCane quality={quality} />;
  }

  return (
    <ModelErrorBoundary fallback={<ProceduralCane quality={quality} />}>
      <Suspense fallback={null}>
        <GltfCane quality={quality} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

if (USE_GLB_MODEL) {
  useGLTF.preload(CANE_MODEL_URL);
}

function GltfCane({ quality }: { quality: QualityProfile }) {
  const { scene } = useGLTF(CANE_MODEL_URL);

  const root = useMemo(() => {
    const model = scene.clone(true);

    // --- Normalise into cane space -----------------------------------
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale =
      size.y > 0 ? (CANE_HEIGHT / size.y) * GLB_ADJUST.scale : GLB_ADJUST.scale;

    model.position.set(-center.x, -box.min.y, -center.z);

    const wrapper = new THREE.Group();
    wrapper.name = "dodream-cane-glb";
    wrapper.add(model);
    wrapper.scale.setScalar(scale);
    wrapper.position.y = -CANE_HEIGHT / 2;
    wrapper.rotation.y = GLB_ADJUST.yaw;
    wrapper.updateMatrixWorld(true);

    // --- Adopt hotspot empties, when the model provides them ----------
    const worldPosition = new THREE.Vector3();
    let overrides = 0;
    PRODUCT_FEATURES.forEach((feature) => {
      const node = model.getObjectByName(feature.nodeName);
      if (!node) return;
      node.getWorldPosition(worldPosition);
      setFeatureAnchor(feature.id, worldPosition.toArray() as Vec3);
      overrides += 1;
    });
    if (overrides === 0) resetFeatureAnchors();

    // --- Match the scene's shading budget ------------------------------
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = quality.shadows;
      child.receiveShadow = quality.shadows;
      child.frustumCulled = true;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = 1.1;
        }
      });
    });

    return wrapper;
  }, [scene, quality.shadows]);

  useEffect(() => {
    return () => {
      // The cached original stays in drei's loader cache; only the clone's
      // geometry is ours to release.
      root.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry?.dispose();
      });
      resetFeatureAnchors();
    };
  }, [root]);

  return <primitive object={root} />;
}

/**
 * A missing or malformed GLB must never take the page down — it silently
 * falls back to the placeholder product.
 */
class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[DoDream] Falling back to the placeholder cane:", error);
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
