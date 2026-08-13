"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { QualityProfile } from "@/lib/quality";

export type CaneMaterialSet = {
  /** Anodised aluminium — shaft, neck, collars. */
  shell: THREE.MeshStandardMaterial;
  /** Soft-touch polymer — grip sleeve, sensor housings. */
  grip: THREE.MeshStandardMaterial;
  /** Copper accent — haptic collar, brand marks. */
  accent: THREE.MeshStandardMaterial;
  /** Sensor glass. */
  lens: THREE.MeshStandardMaterial;
  /** Matte rubber tip. */
  rubber: THREE.MeshStandardMaterial;
  /** Emissive status point. */
  led: THREE.MeshStandardMaterial;
  all: THREE.MeshStandardMaterial[];
};

/**
 * Materials are built once per quality profile and disposed on unmount.
 * Physical (clearcoat) materials are reserved for tiers that can pay for the
 * extra shader work; lower tiers fall back to standard PBR, which keeps the
 * same look family at a fraction of the cost.
 */
export function useCaneMaterials(quality: QualityProfile): CaneMaterialSet {
  const materials = useMemo(() => {
    const physical = quality.physicalMaterials;

    const make = (
      params: THREE.MeshStandardMaterialParameters,
      physicalParams?: THREE.MeshPhysicalMaterialParameters,
    ): THREE.MeshStandardMaterial =>
      physical
        ? new THREE.MeshPhysicalMaterial({ ...params, ...physicalParams })
        : new THREE.MeshStandardMaterial(params);

    const shell = make(
      {
        color: new THREE.Color("#b6b4ae"),
        metalness: 0.92,
        roughness: 0.32,
        envMapIntensity: 1.1,
      },
      { clearcoat: 0.35, clearcoatRoughness: 0.35 },
    );

    const grip = make(
      {
        color: new THREE.Color("#26262a"),
        metalness: 0.06,
        roughness: 0.74,
        envMapIntensity: 0.85,
      },
      { clearcoat: 0.12, clearcoatRoughness: 0.75, sheen: 0.25 },
    );

    const accent = make(
      {
        color: new THREE.Color("#a86a44"),
        metalness: 0.88,
        roughness: 0.28,
        envMapIntensity: 1.25,
      },
      { clearcoat: 0.5, clearcoatRoughness: 0.22 },
    );

    const lens = make(
      {
        color: new THREE.Color("#0a0a0d"),
        metalness: 0.35,
        roughness: 0.08,
        envMapIntensity: 1.4,
      },
      { clearcoat: 1, clearcoatRoughness: 0.04 },
    );

    const rubber = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#17171a"),
      metalness: 0.02,
      roughness: 0.93,
      envMapIntensity: 0.5,
    });

    const led = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a1a1d"),
      emissive: new THREE.Color("#d99a6c"),
      emissiveIntensity: 1.6,
      metalness: 0,
      roughness: 0.4,
      toneMapped: false,
    });

    return {
      shell,
      grip,
      accent,
      lens,
      rubber,
      led,
      all: [shell, grip, accent, lens, rubber, led],
    };
  }, [quality.physicalMaterials]);

  useEffect(() => {
    return () => {
      materials.all.forEach((material) => material.dispose());
    };
  }, [materials]);

  return materials;
}
