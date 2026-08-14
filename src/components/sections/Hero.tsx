"use client";

import { motion } from "framer-motion";
import { CopyScrim } from "@/components/ui/CopyScrim";
import { experience, useExperience } from "@/lib/experience-store";
import { scrollToChapter } from "@/lib/navigate";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function Hero() {
  const reduced = useReducedMotion();
  const introComplete = useExperience((state) => state.introComplete);

  const rise = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 22 },
    animate: introComplete
      ? { opacity: 1, y: 0 }
      : reduced
        ? { opacity: 0 }
        : { opacity: 0, y: 22 },
    transition: {
      duration: reduced ? 0.25 : 1,
      delay: reduced ? 0 : delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section
      id="hero"
      aria-label="두드림 — 보이지 않는 길을, 더 안전하게"
      className="relative flex min-h-svh items-start pt-24 pb-24 sm:items-center sm:pt-20 sm:pb-20"
    >
      <CopyScrim edge="bottom" size="16svh" />

      <div className="relative shell w-full">
        <div className="max-w-[42rem]">
          <motion.p className="eyebrow" {...rise(0.05)}>
            두드림 — 스마트 지팡이
          </motion.p>

          {/*
            The break is placed on the sentence's own joint — after the object
            phrase, before the predicate — rather than wherever the container
            happens to run out. Two lines, each a complete unit, and nothing
            can strand a trailing syllable on a line of its own.
          */}
          <motion.h1 className="display-xl mt-6" {...rise(0.14)}>
            보이지 않는 길을,
            <br />더 안전하게
          </motion.h1>

          <motion.p className="lede mt-7" {...rise(0.24)}>
            스마트 기술을 지팡이에 담아, 주변을 먼저 살피고 필요한 정보를
            전달합니다.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            {...rise(0.32)}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => scrollToChapter("product")}
            >
              스마트 지팡이 알아보기
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => experience.setWaitlistOpen(true)}
            >
              바로가기
            </button>
          </motion.div>

          {/*
            The quiet invitation. It sits under the pair rather than inside it,
            so it can never become a third item competing for the CTA row or
            stack into it on a narrow screen. No box, no badge — just the
            hero's own small-text colour, one accent dot to catch the eye, and
            the same fake door the ghost button opens.
          */}
          <motion.div className="mt-6" {...rise(0.4)}>
            <button
              type="button"
              onClick={() => experience.setWaitlistOpen(true)}
              className="inline-flex items-center gap-2.5 text-[0.8125rem] text-soft transition-colors duration-300 hover:text-[rgb(var(--stage-ink))]"
            >
              <span
                aria-hidden="true"
                className="block h-[0.3125rem] w-[0.3125rem] flex-none rounded-full"
                style={{ backgroundColor: "rgb(var(--stage-accent))" }}
              />
              출시 소식 가장 먼저 받아보기
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-7 flex justify-center sm:bottom-9"
        {...rise(0.55)}
      >
        <span className="cue flex items-center gap-2.5 text-faint">
          <span aria-hidden="true" className="hidden sm:inline">
            커서를 움직여 보세요 · 스크롤
          </span>
          <span aria-hidden="true" className="sm:hidden">
            드래그해 보세요 · 스크롤
          </span>
          <ScrollLine reduced={reduced} />
        </span>
      </motion.div>
    </section>
  );
}

function ScrollLine({ reduced }: { reduced: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative block h-px w-10 overflow-hidden"
      style={{ backgroundColor: "rgb(var(--stage-line) / 0.2)" }}
    >
      {reduced ? null : (
        <motion.span
          className="absolute inset-y-0 left-0 block w-4"
          style={{ backgroundColor: "rgb(var(--stage-accent))" }}
          animate={{ x: ["-1rem", "2.5rem"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </span>
  );
}
