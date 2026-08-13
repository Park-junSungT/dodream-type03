"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CopyScrim } from "@/components/ui/CopyScrim";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const SPECS = [
  { label: "Weight", value: "Under 400 g" },
  { label: "Body", value: "Anodised aluminium" },
  { label: "Grip", value: "Sensing handle" },
];

/**
 * Chapter 02. One sticky frame holds the writing still while the camera walks
 * around the product behind it — the copy is the caption, the cane is the shot.
 */
export function ProductReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The detail block arrives as the camera closes in on the product.
  const detailOpacity = useTransform(scrollYProgress, [0.32, 0.55], [0, 1]);
  const detailShift = useTransform(
    scrollYProgress,
    [0.32, 0.55],
    [reduced ? 0 : 24, 0],
  );

  return (
    <section
      id="product"
      ref={sectionRef}
      aria-label="More than a cane"
      className="relative min-h-[200svh]"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-between py-24 sm:py-28">
        <CopyScrim edge="top" size="30svh" />
        <CopyScrim edge="bottom" size="38svh" />

        <div className="relative shell">
          <Reveal amount={0.2}>
            <p className="eyebrow">02 — Product</p>
            <h2 className="display-lg mt-5 max-w-[14ch]">More than a cane.</h2>
          </Reveal>
        </div>

        <div className="relative shell flex justify-start sm:justify-end">
          <motion.div
            className="max-w-[26rem]"
            style={{ opacity: detailOpacity, y: detailShift }}
          >
            <p className="lede max-w-none">
              Machined, balanced and finished like a piece of consumer hardware
              — because that is what it is. Every sensor sits inside the form
              you already know how to hold.
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-t pt-6 border-stage">
              {SPECS.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-[0.625rem] uppercase tracking-[0.16em] text-faint">
                    {spec.label}
                  </dt>
                  <dd className="mt-2 text-[0.875rem] leading-snug">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
