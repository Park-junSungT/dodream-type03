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
      aria-label="이동의 가능성을 넓히다"
      className="relative min-h-[180svh]"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-between py-28 sm:py-32">
        <CopyScrim edge="top" size="32svh" />
        <CopyScrim edge="bottom" size="34svh" />

        <div className="relative shell">
          <Reveal amount={0.25}>
            <p className="eyebrow">05 — 비전</p>
            <h2 className="display-lg mt-6">
              이동의 가능성을
              <br />넓히다.
            </h2>
          </Reveal>
        </div>

        <div className="relative shell flex justify-start sm:justify-end">
          <Reveal amount={0.25} delay={0.08}>
            <p className="lede sm:text-right">
              DoDream은 시각장애인의 일상적인 이동이 더 자유롭고 자연스러워질 수
              있도록 새로운 가능성을 만들어갑니다.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
