"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experience, useExperience } from "@/lib/experience-store";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const MINIMUM_VISIBLE_MS = 700;

/**
 * The first thing anyone sees. It holds the page still just long enough for
 * the stage to draw its first frames, shows real progress rather than a
 * spinner, and never outstays its welcome — `ExperienceStage` releases it on
 * a timeout even if WebGL never reports back.
 *
 * The progress bar is written straight to the DOM: a loading indicator that
 * re-rendered React sixty times a second would be competing with the very
 * thing it is waiting for.
 */
export function IntroOverlay() {
  const sceneReady = useExperience((state) => state.sceneReady);
  const introComplete = useExperience((state) => state.introComplete);
  const reduced = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const mountedAt = useRef(0);

  // Ramp toward, but never reach, completion while the scene warms up.
  useEffect(() => {
    mountedAt.current = Date.now();
    let progress = 0.04;
    let frame = 0;

    const tick = () => {
      progress += (0.88 - progress) * 0.035;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!sceneReady || introComplete) return;
    if (barRef.current) barRef.current.style.transform = "scaleX(1)";

    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, MINIMUM_VISIBLE_MS - elapsed) + 260;
    const timeout = window.setTimeout(
      () => experience.setIntroComplete(true),
      wait,
    );
    return () => window.clearTimeout(timeout);
  }, [sceneReady, introComplete]);

  // Hold the page still underneath, and start every visit at the top.
  useEffect(() => {
    if (introComplete) {
      document.body.removeAttribute("data-scroll-locked");
      return;
    }
    document.body.setAttribute("data-scroll-locked", "true");
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    return () => document.body.removeAttribute("data-scroll-locked");
  }, [introComplete]);

  return (
    <AnimatePresence>
      {introComplete ? null : (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--stage-bg)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          aria-live="polite"
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-display text-[clamp(2rem,6vw,3.25rem)] font-medium tracking-[-0.045em]">
              두드림
            </span>
            <div
              className="mt-7 h-px w-40 overflow-hidden sm:w-56"
              style={{ backgroundColor: "rgb(var(--stage-line) / 0.16)" }}
            >
              <div
                ref={barRef}
                className="h-full origin-left"
                style={{
                  backgroundColor: "rgb(var(--stage-accent))",
                  transform: "scaleX(0.04)",
                  transition: "transform 320ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
