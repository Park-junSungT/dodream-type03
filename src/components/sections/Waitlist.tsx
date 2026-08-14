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
      aria-label="DoDream을 먼저 만나보세요"
      className="relative flex min-h-svh flex-col justify-end pt-40 sm:pt-48"
    >
      <div className="shell w-full">
        <div className="mx-auto max-w-[44rem] text-center">
          <Reveal amount={0.3}>
            <p className="eyebrow">06 — 다음 단계</p>
            <h2 className="display-lg mt-6 mx-auto">
              스마트 지팡이를
              <br />사용해 보세요
            </h2>
            {/* <p className="lede mx-auto mt-7">
              DoDream의 출시 소식을 가장 먼저 받아보세요.
            </p> */}
          </Reveal>

          <Reveal amount={0.3} delay={0.1}>
            <div className="mt-11 flex flex-col items-center gap-4">
              <button
                type="button"
                className="btn btn-primary h-[3.25rem] px-8"
                onClick={() => experience.setWaitlistOpen(true)}
              >
                {joined ? "신청 완료" : "바로가기"}
              </button>
              <p className="text-[0.75rem] text-faint">
                {joined
                  ? ""
                  : ""}
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
            두드림 - 스마트 지팡이
          </span>
          {/* <p className="max-w-[38em] text-[0.6875rem] leading-relaxed text-faint">
            시각장애인의 더 나은 이동을 위한 스마트 지팡이. DoDream은 초기 단계의
            제품 콘셉트이며, 제품 이미지는 디자인 표현이고 사양은 확정되지
            않았습니다.
          </p> */}
        </div>
      </footer>
    </section>
  );
}
