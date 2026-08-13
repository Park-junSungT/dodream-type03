"use client";

import { TECHNOLOGY_CARDS } from "@/lib/features";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Chapter 04. The product steps back and to one side; the writing leads.
 * Claims stay at the level of intent — designed to, built for, a foundation
 * for — because that is what is true today.
 */
export function Technology() {
  return (
    <section
      id="technology"
      aria-label="Technology that stays out of the way"
      className="relative flex min-h-svh items-center py-32 sm:py-40"
    >
      <div className="shell w-full">
        <div className="max-w-[46rem]">
          <Reveal amount={0.3}>
            <p className="eyebrow">04 — Technology</p>
            <h2 className="display-lg mt-5 max-w-[16ch]">
              Technology that stays out of the way.
            </h2>
          </Reveal>
        </div>

        <ul className="mt-14 grid max-w-[46rem] grid-cols-1 gap-3 sm:mt-20 sm:grid-cols-2 sm:gap-4">
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

        <Reveal amount={0.4}>
          <p className="mt-10 max-w-[42ch] text-[0.75rem] leading-relaxed text-faint">
            DoDream is an assistive product in development. It is designed to
            support awareness and everyday independence, not to replace
            attention, judgement or care.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
