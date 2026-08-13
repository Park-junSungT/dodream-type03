"use client";

import { CopyScrim } from "@/components/ui/CopyScrim";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Chapter 05. The cinematic breath: the product returns to the middle of an
 * open, dark room and slowly turns.
 *
 * The copy is set to the outside edges rather than centred, so the turning
 * product keeps the middle of the frame to itself.
 */
export function Vision() {
  return (
    <section
      id="vision"
      aria-label="Mobility can be smarter"
      className="relative min-h-[180svh]"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-between py-28 sm:py-32">
        <CopyScrim edge="top" size="32svh" />
        <CopyScrim edge="bottom" size="34svh" />

        <div className="relative shell">
          <Reveal amount={0.25}>
            <p className="eyebrow">05 — Vision</p>
            <h2 className="display-lg mt-6 max-w-[13ch]">
              Mobility can be smarter.
            </h2>
          </Reveal>
        </div>

        <div className="relative shell flex justify-start sm:justify-end">
          <Reveal amount={0.25} delay={0.08}>
            <p className="lede max-w-[38ch] sm:text-right">
              DoDream is building a future where assistive technology feels
              natural, intuitive, and beautifully designed.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
