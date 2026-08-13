"use client";

import { Reveal } from "@/components/ui/Reveal";
import { experience, useExperience } from "@/lib/experience-store";

/**
 * Chapter 06 — the fake door. The product lifts away and the invitation
 * takes the room. Interest is measured here, and nowhere else on the page.
 */
export function Waitlist() {
  const joined = useExperience((state) => state.waitlistJoined);

  return (
    <section
      id="waitlist"
      aria-label="Be part of the next step"
      className="relative flex min-h-svh flex-col justify-end pt-40 sm:pt-48"
    >
      <div className="shell w-full">
        <div className="mx-auto max-w-[44rem] text-center">
          <Reveal amount={0.3}>
            <p className="eyebrow">06 — Next step</p>
            <h2 className="display-lg mt-6 max-w-[16ch] mx-auto">
              Be part of the next step.
            </h2>
            <p className="lede mx-auto mt-7 max-w-[46ch]">
              DoDream is currently exploring the future of smart mobility. Join
              the waitlist to be the first to hear when DoDream becomes
              available.
            </p>
          </Reveal>

          <Reveal amount={0.3} delay={0.1}>
            <div className="mt-11 flex flex-col items-center gap-4">
              <button
                type="button"
                className="btn btn-primary h-[3.25rem] px-8"
                onClick={() => experience.setWaitlistOpen(true)}
              >
                {joined ? "You're on the list" : "Join the DoDream Waitlist"}
              </button>
              <p className="text-[0.75rem] text-faint">
                {joined
                  ? "We'll keep you updated as DoDream takes its next step."
                  : "No commitment — we'll only get in touch when there's news."}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <footer className="shell mt-28 w-full pb-10 sm:mt-36">
        <div
          className="flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "rgb(var(--stage-line) / 0.1)" }}
        >
          <span className="font-display text-[0.9375rem] font-medium tracking-[-0.02em]">
            DoDream
          </span>
          <p className="max-w-[46ch] text-[0.6875rem] leading-relaxed text-faint">
            DoDream is an early-stage product concept. Product imagery is a
            design representation and specifications are indicative.
          </p>
        </div>
      </footer>
    </section>
  );
}
