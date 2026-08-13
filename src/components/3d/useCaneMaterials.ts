"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { QualityProfile } from "@/lib/quality";

export type CaneMaterialSet = {
  /** Off-white composite body — the bulk of the product. */
  shell: THREE.MeshStandardMaterial;
  /** Textured matte grip below the cap. */
  grip: THREE.MeshStandardMaterial;
  /** Brushed aluminium — top cap, lens bezel. */
  metal: THREE.MeshStandardMaterial;
  /** Slightly darker aluminium — the bottom tip. */
  metalTip: THREE.MeshStandardMaterial;
  /** Glossy black sensor glass. */
  lens: THREE.MeshStandardMaterial;
  /** Matte charcoal — port slot, seam, microphone. */
  dark: THREE.MeshStandardMaterial;
  /** A half-tone of the shell, so a moulded recess reads as one. */
  recess: THREE.MeshStandardMaterial;
  /** Woven wrist-strap cord. */
  strap: THREE.MeshStandardMaterial;
  all: THREE.Material[];
  textures: THREE.Texture[];
};

/**
 * A fine diagonal knurl for the grip, drawn once into a small canvas and used
 * as a bump and roughness map. It is the one texture in the scene — a 128px
 * canvas rather than an image request — and it only exists on tiers that can
 * afford the extra sampler.
 */
function createKnurlTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#808080";
  context.fillRect(0, 0, size, size);
  context.lineWidth = 1.6;

  // Two opposing diagonal sets make the woven cross-hatch of the reference.
  for (const [angle, tone] of [
    [1, "#d8d8d8"],
    [-1, "#4a4a4a"],
  ] as const) {
    context.strokeStyle = tone;
    for (let i = -size; i < size * 2; i += 8) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i + angle * size, size);
      context.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 11);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Materials for the DoDream cane, built once per quality profile and disposed
 * on unmount.
 *
 * The palette follows the product reference: an off-white satin body, a matte
 * textured grip, brushed aluminium at the cap and tip, and black only where
 * there is glass or a port. Physical (clearcoat) materials are reserved for
 * tiers that can pay for the extra shader work; lower tiers fall back to
 * standard PBR, which keeps the same look family far more cheaply.
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

    const knurl = physical ? createKnurlTexture() : null;

    const shell = make(
      {
        color: new THREE.Color("#efece6"),
        metalness: 0.04,
        roughness: 0.38,
        envMapIntensity: 0.9,
      },
      { clearcoat: 0.45, clearcoatRoughness: 0.42 },
    );

    const grip = make(
      {
        color: new THREE.Color("#e1ded5"),
        metalness: 0.02,
        roughness: 0.7,
        envMapIntensity: 0.75,
        // Only set the map keys when there is a map: three warns on undefined.
        ...(knurl ? { bumpMap: knurl, bumpScale: 0.35, roughnessMap: knurl } : {}),
      },
      { clearcoat: 0.08, clearcoatRoughness: 0.85 },
    );

    /*
     * The cap and tip are brushed aluminium, but a fully metallic surface has
     * no diffuse term — on a body this slender it would mirror the dark gaps
     * between the studio panels and read as near-black. Half-metal with a
     * bright base keeps the brushed look and the light grey of the reference.
     */
    const metal = make(
      {
        color: new THREE.Color("#cdcbc6"),
        metalness: 0.5,
        roughness: 0.34,
        envMapIntensity: 1.25,
      },
      { clearcoat: 0.4, clearcoatRoughness: 0.28 },
    );

    const metalTip = make(
      {
        color: new THREE.Color("#a9a7a2"),
        metalness: 0.45,
        roughness: 0.44,
        envMapIntensity: 1.1,
      },
      { clearcoat: 0.25, clearcoatRoughness: 0.4 },
    );

    const lens = make(
      {
        color: new THREE.Color("#0a0a0c"),
        metalness: 0.3,
        roughness: 0.06,
        envMapIntensity: 1.5,
      },
      { clearcoat: 1, clearcoatRoughness: 0.03 },
    );

    const dark = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1c1c1f"),
      metalness: 0.15,
      roughness: 0.62,
      envMapIntensity: 0.6,
    });

    const recess = make(
      {
        color: new THREE.Color("#d3d0c7"),
        metalness: 0.05,
        roughness: 0.5,
        envMapIntensity: 0.7,
      },
      { clearcoat: 0.3, clearcoatRoughness: 0.5 },
    );

    const strap = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d5d1c8"),
      metalness: 0,
      roughness: 0.86,
      envMapIntensity: 0.7,
    });

    return {
      shell,
      grip,
      metal,
      metalTip,
      lens,
      dark,
      recess,
      strap,
      all: [
        shell,
        grip,
        metal,
        metalTip,
        lens,
        dark,
        recess,
        strap,
      ] as THREE.Material[],
      textures: knurl ? [knurl as THREE.Texture] : [],
    };
  }, [quality.physicalMaterials]);

  useEffect(() => {
    return () => {
      materials.all.forEach((material) => material.dispose());
      materials.textures.forEach((texture) => texture.dispose());
    };
  }, [materials]);

  return materials;
}
