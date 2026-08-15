"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CopyScrim } from "@/components/ui/CopyScrim";
import { Reveal } from "@/components/ui/Reveal";
import { scrollToChapter } from "@/lib/navigate";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const SPECS = [
  { label: "무게", value: "380g" },
  { label: "소재", value: "알루미늄" },
  { label: "지팡이", value: "센서 장착" },
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
      aria-label="스마트 지팡이를 소개합니다"
      className="relative min-h-[200svh]"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-between py-24 sm:py-28">
        <CopyScrim edge="top" size="30svh" />
        <CopyScrim edge="bottom" size="38svh" />

        <div className="relative shell">
          <Reveal amount={0.2}>
            <p className="eyebrow">02 — 제품</p>
            <h2 className="display-lg mt-5">
              스마트 지팡이를
              <br />소개합니다
            </h2>
          </Reveal>
        </div>

        <div className="relative shell flex justify-start sm:justify-end">
          <motion.div
            className="max-w-[26rem]"
            style={{ opacity: detailOpacity, y: detailShift }}
          >
            <p className="lede max-w-none">
              스마트 지팡이는 거동이 불편한 시각장애인을 위해 안전한 보행을 목적으로 
              설계된 스마트 지팡이입니다.
              {/* 흰지팡이는 오랫동안 일상적인 이동을 함께해온 도구입니다. DoDream은
              그 익숙한 형태에 스마트 기술을 더해, 지팡이가 할 수 있는 일을
              넓혀갑니다. */}
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

            {/*
              The doorway into chapter 03, where the product is already
              draggable and its components already open on tap. It sits at the
              end of the spec block because that is where the reader runs out
              of things to read — and it points at the section directly below,
              so the invitation and the experience are one scroll apart.
            */}
            <button
              type="button"
              onClick={() => scrollToChapter("explore")}
              className="group mt-7 inline-flex items-center gap-2 text-[0.8125rem] text-soft transition-colors duration-300 hover:text-[rgb(var(--stage-ink))]"
            >
              스마트 지팡이 체험하기
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
