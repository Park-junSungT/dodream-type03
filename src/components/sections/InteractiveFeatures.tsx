"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CopyScrim } from "@/components/ui/CopyScrim";
import { FeaturePanel } from "@/components/ui/FeaturePanel";
import { Reveal } from "@/components/ui/Reveal";
import { useExperience } from "@/lib/experience-store";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Chapter 03. The product holds a stable three-quarter shot while markers,
 * a component list and an information panel let the reader take it apart.
 */
export function InteractiveFeatures() {
  const activeFeature = useExperience((state) => state.activeFeature);
  const exploring = useExperience((state) => state.exploring);
  const hasInteracted = useExperience((state) => state.hasInteracted);
  const reduced = useReducedMotion();

  const focused = activeFeature !== null;

  return (
    <section
      id="explore"
      aria-label="Designed around you"
      className="relative min-h-[230svh]"
    >
      <div className="sticky top-0 h-svh">
        <CopyScrim edge="top" size="36svh" />

        <div className="relative shell flex h-full flex-col justify-between gap-8 py-24 sm:py-28 lg:flex-row lg:items-end lg:gap-16">
          <motion.div
            className="max-w-[30rem] lg:self-start lg:pt-6"
            animate={{ opacity: focused ? 0.28 : 1 }}
            transition={{ duration: reduced ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Reveal amount={0.2}>
              <p className="eyebrow">03 — Explore</p>
              <h2 className="display-lg mt-5 max-w-[13ch]">
                Designed around you.
              </h2>
              <p className="lede mt-6 max-w-[34ch]">
                Turn the product to look around it, then open a marker to see
                what sits inside.
              </p>
            </Reveal>
          </motion.div>

          <div className="w-full lg:w-[21rem] lg:shrink-0 lg:self-center">
            <FeaturePanel />
          </div>
        </div>

        <AnimatePresence>
          {exploring && !hasInteracted && !focused ? (
            <motion.p
              key="hint"
              className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center text-[0.6875rem] uppercase tracking-[0.22em] text-faint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.6 }}
            >
              <span className="hidden sm:inline">
                Drag to rotate · Click a marker
              </span>
              <span className="sm:hidden">Swipe to rotate · Tap a marker</span>
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
