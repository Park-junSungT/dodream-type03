"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PRODUCT_FEATURES, getFeature } from "@/lib/features";
import { experience, useExperience } from "@/lib/experience-store";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The reading surface for chapter 03.
 *
 * Idle, it lists the six components — a keyboard- and screen-reader-friendly
 * equivalent of the markers floating on the product. Selected, it becomes a
 * single quiet card, and everything else on screen steps back.
 */
export function FeaturePanel() {
  const activeId = useExperience((state) => state.activeFeature);
  const exploring = useExperience((state) => state.exploring);
  const reduced = useReducedMotion();
  const feature = getFeature(activeId);

  const duration = reduced ? 0.15 : 0.45;

  return (
    <div
      data-interactive
      className="w-full rounded-[1.25rem] border p-5 sm:p-6"
      style={{
        borderColor: "rgb(var(--stage-line) / 0.12)",
        backgroundColor: "rgb(var(--stage-ink) / 0.04)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {feature ? (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
            role="region"
            aria-live="polite"
            aria-label={`${feature.title} details`}
          >
            <p className="eyebrow">
              {String(indexOf(feature.id) + 1).padStart(2, "0")} — Component
            </p>
            <h3 className="mt-4 font-display text-[1.75rem] leading-[1.05] tracking-[-0.035em]">
              {feature.title}
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-soft">
              {feature.body}
            </p>
            <p className="mt-4 border-t pt-4 text-[0.75rem] text-faint border-stage">
              {feature.detail}
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-5 w-full"
              onClick={() => experience.setActiveFeature(null)}
            >
              Back to the full product
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">Components</p>
            {/*
             * Below `lg` the panel is docked under the product, so the list
             * becomes a single scrolling rail — it keeps the panel short and
             * leaves the cane the height it needs.
             */}
            <ul className="-mx-1 mt-4 flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:mt-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
              {PRODUCT_FEATURES.map((item, index) => (
                <li key={item.id} className="shrink-0 snap-start lg:shrink">
                  <button
                    type="button"
                    tabIndex={exploring ? 0 : -1}
                    onClick={() => {
                      experience.markInteracted();
                      experience.toggleFeature(item.id);
                    }}
                    className="group flex w-full items-center gap-2 rounded-full border px-3 py-2 text-left transition-colors duration-300 hover:bg-[rgb(var(--stage-ink)/0.06)] lg:gap-3 lg:rounded-lg lg:border-transparent lg:px-2 lg:py-2.5"
                    style={{ borderColor: "rgb(var(--stage-line) / 0.14)" }}
                  >
                    <span className="text-[0.625rem] tabular-nums text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="whitespace-nowrap text-[0.8125rem] leading-tight lg:whitespace-normal">
                      {item.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-auto hidden text-faint transition-transform duration-300 group-hover:translate-x-0.5 lg:block"
                    >
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function indexOf(id: string) {
  return PRODUCT_FEATURES.findIndex((feature) => feature.id === id);
}
