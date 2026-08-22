"use client";

import type { ReactNode } from "react";

/**
 * A handset, built out of HTML and CSS — borders, radii, gradients and
 * shadows. No SVG anywhere in the frame, so everything inside the screen
 * stays real, responsive, interactive DOM.
 *
 * The frame is present at every size now that the three stack rather than
 * taking the viewport one at a time: on a phone the reader is looking at a
 * row of devices told as a story, and a device needs an edge to read as one.
 */
export function PhoneShell({
  children,
  className = "",
  screenClassName = "",
  emphasis = false,
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  /** The product screen carries a fraction more depth than the two beside it. */
  emphasis?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-none flex-col rounded-[2.4rem] p-[0.55rem] ${
        emphasis
          ? "shadow-[0_2px_2px_rgba(255,255,255,0.22)_inset,0_34px_74px_-22px_rgba(0,0,0,0.42),0_12px_26px_-14px_rgba(0,0,0,0.34)]"
          : "shadow-[0_2px_2px_rgba(255,255,255,0.18)_inset,0_24px_56px_-24px_rgba(0,0,0,0.32),0_8px_20px_-14px_rgba(0,0,0,0.26)]"
      } ${className}`}
    >
      {/* Brushed frame. Two stops and an inset highlight, not a chrome render. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[2.4rem]"
        style={{ background: "linear-gradient(150deg,#3a3d44,#1b1c21 42%,#26282e)" }}
      />

      <span aria-hidden="true" className="absolute -left-[2px] top-[6.2rem] h-7 w-[3px] rounded-l-sm bg-[#15161a]" />
      <span aria-hidden="true" className="absolute -left-[2px] top-[8.2rem] h-11 w-[3px] rounded-l-sm bg-[#15161a]" />
      <span aria-hidden="true" className="absolute -right-[2px] top-[7.4rem] h-[3.2rem] w-[3px] rounded-r-sm bg-[#15161a]" />

      <div
        className={`relative flex aspect-[9/19.5] flex-none flex-col overflow-hidden rounded-[1.95rem] ${screenClassName}`}
      >
        {children}

        {/* Camera island, sitting over the display. */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[0.5rem] z-20 h-[1.2rem] w-[4.6rem] -translate-x-1/2 rounded-full bg-[#0d0e11]"
        >
          <span className="absolute right-[0.5rem] top-1/2 block h-[0.4rem] w-[0.4rem] -translate-y-1/2 rounded-full bg-[#1d2733]" />
        </span>

        {/* One soft highlight — glass rather than gloss. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(158deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 22%, transparent 46%)",
          }}
        />
      </div>
    </div>
  );
}

/** The status bar every screen opens with. */
export function StatusBar({
  clock,
  dark = false,
}: {
  clock: string;
  dark?: boolean;
}) {
  const ink = dark ? "rgb(255 255 255 / 0.92)" : "rgb(var(--stage-ink) / 0.9)";
  return (
    <div className="flex flex-none items-center justify-between px-4 pt-[1.5rem]">
      <span
        className="text-[0.6875rem] font-medium tabular-nums"
        style={{ color: ink }}
      >
        {clock}
      </span>
      <span aria-hidden="true" className="flex items-center gap-[3px]">
        {[0.45, 0.65, 0.85, 1].map((h) => (
          <span
            key={h}
            className="block w-[3px] rounded-[1px]"
            style={{ height: `${3 + h * 5}px`, backgroundColor: ink, opacity: 0.75 }}
          />
        ))}
        <span
          className="ml-1.5 block h-[9px] w-[17px] rounded-[3px] border"
          style={{ borderColor: ink, opacity: 0.7 }}
        >
          <span
            className="mt-[1.5px] ml-[1.5px] block h-[4px] rounded-[1px]"
            style={{ width: "10px", backgroundColor: ink }}
          />
        </span>
      </span>
    </div>
  );
}
