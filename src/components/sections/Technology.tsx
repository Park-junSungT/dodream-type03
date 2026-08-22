"use client";

import { TECHNOLOGY_CARDS } from "@/lib/features";
import { Reveal } from "@/components/ui/Reveal";
import { MvpFilm } from "@/components/ui/MvpFilm";

/**
 * Chapter 04. The product steps back and to one side; the writing leads.
 * Claims stay at the level of intent — designed to, built for, a foundation
 * for — because that is what is true today.
 */
export function Technology() {
  return (
    <section
      id="technology"
      aria-label="기술은 자연스러워야 하니까"
      className="relative flex min-h-svh items-center py-32 sm:py-40"
    >
      <div className="shell w-full">
        <div className="max-w-[46rem]">
          <Reveal amount={0.3}>
            <p className="eyebrow">04 — 기술</p>
            <h2 className="display-lg mt-5">
              안전을
              <br />중심으로 설계했습니다.
            </h2>
          </Reveal>
        </div>


        <div className="mt-14 flex flex-col sm:mt-20 lg:flex-row lg:items-start lg:gap-12">
        {/*
          The claims here are about intent. This is the device itself, running —
          it belongs beside them, read as evidence rather than decoration.

          One instance, moved by `order` rather than rendered twice at two
          breakpoints: a second copy would sit inert behind `display:none`,
          holding an observer and a second element for nothing. Stacked it leads
          the cards; from `lg` it sits out to their right.
        */}
          <Reveal
            amount={0.25}
            className="order-first mb-10 flex-none lg:order-last lg:mb-0"
          >
            <MvpFilm />
          </Reveal>

        <ul className="grid max-w-[46rem] flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {TECHNOLOGY_CARDS.map((card, index) => (
            <Reveal
              key={card.id}
              as="li"
              amount={0.3}
              delay={index * 0.06}
              className="h-full"
            >
              <div
                data-interactive
                className="flex h-full flex-col rounded-[1.25rem] border p-6 transition-colors duration-500 sm:p-7"
                style={{
                  borderColor: "rgb(var(--stage-line) / 0.12)",
                  backgroundColor: "rgb(var(--stage-ink) / 0.035)",
                }}
              >
                <span className="text-[0.625rem] tabular-nums tracking-[0.16em] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-[1.375rem] leading-tight tracking-[-0.03em]">
                  {card.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-soft">
                  {card.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        </div>

        <Reveal amount={0.4}>
          <p className="mt-10 max-w-[34em] text-[0.75rem] leading-relaxed text-faint">
            스마트 지팡이는 일상적인 이동과 주변 인지를
            돕도록 설계했으며, 사용자의 주의나 판단을 대신하지 않습니다.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
