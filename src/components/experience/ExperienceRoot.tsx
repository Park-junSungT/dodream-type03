"use client";

import { ExperienceStage } from "./ExperienceStage";
import { StageDriver } from "./StageDriver";
import { Navbar } from "@/components/ui/Navbar";
import { IntroOverlay } from "@/components/ui/IntroOverlay";
import { WaitlistModal } from "@/components/ui/WaitlistModal";
import { Hero } from "@/components/sections/Hero";
import { ProductReveal } from "@/components/sections/ProductReveal";
import { InteractiveFeatures } from "@/components/sections/InteractiveFeatures";
import { Technology } from "@/components/sections/Technology";
import { Vision } from "@/components/sections/Vision";
import { Waitlist } from "@/components/sections/Waitlist";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Composes the experience.
 *
 * The 3D stage is fixed behind the document and the story scrolls over it, so
 * there is exactly one product, one camera and one continuous scene from the
 * first screen to the waitlist.
 */
export function ExperienceRoot() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <StageDriver />
      <ExperienceStage reducedMotion={reducedMotion} />

      <a
        href="#waitlist"
        className="sr-only rounded-full px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-[rgb(var(--stage-ink))] focus:text-[var(--stage-bg)]"
      >
        관심 등록으로 바로가기
      </a>

      <Navbar />

      <main id="main" className="story-layer relative z-20">
        <Hero />
        <ProductReveal />
        <InteractiveFeatures />
        <Technology />
        <Vision />
        <Waitlist />
      </main>

      <WaitlistModal />
      <IntroOverlay />
    </>
  );
}
