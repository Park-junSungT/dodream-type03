"use client";

import type { ReactNode } from "react";

/**
 * A handset, built out of HTML and CSS — borders, radii, gradients and
 * shadows. No SVG anywhere in the frame, so everything inside the screen
 * stays real, responsive, interactive DOM.
 *
 * The frame only exists from `md` up. Below that the screen takes the
 * viewport: a phone drawn inside a phone is a mockup, not a product.
 */
export function PhoneShell({
  children,
  className = "",
  screenClassName = "",
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col md:flex-none md:rounded-[2.6rem] md:p-[0.6rem] md:shadow-[0_2px_2px_rgba(255,255,255,0.22)_inset,0_30px_70px_-24px_rgba(0,0,0,0.5),0_10px_24px_-14px_rgba(0,0,0,0.38)] ${className}`}
    >
      {/* Brushed frame. Two stops and an inset highlight, not a chrome render. */}
      <div
        className="pointer-events-none absolute inset-0 hidden rounded-[2.6rem] md:block"
        style={{ background: "linear-gradient(150deg,#3a3d44,#1b1c21 42%,#26282e)" }}
      />

      <span aria-hidden="true" className="absolute -left-[2px] top-[6.6rem] hidden h-8 w-[3px] rounded-l-sm bg-[#15161a] md:block" />
      <span aria-hidden="true" className="absolute -left-[2px] top-[8.8rem] hidden h-12 w-[3px] rounded-l-sm bg-[#15161a] md:block" />
      <span aria-hidden="true" className="absolute -right-[2px] top-[7.9rem] hidden h-14 w-[3px] rounded-r-sm bg-[#15161a] md:block" />

      <div
        className={`relative flex min-h-0 flex-1 flex-col overflow-hidden md:aspect-[9/19.5] md:flex-none md:rounded-[2.05rem] ${screenClassName}`}
      >
        {children}

        {/* Camera island, sitting over the display. */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[0.55rem] z-20 hidden h-[1.3rem] w-[5rem] -translate-x-1/2 rounded-full bg-[#0d0e11] md:block"
        >
          <span className="absolute right-[0.5rem] top-1/2 block h-[0.4rem] w-[0.4rem] -translate-y-1/2 rounded-full bg-[#1d2733]" />
        </span>

        {/* One soft highlight — glass rather than gloss. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 hidden md:block"
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
    <div className="flex flex-none items-center justify-between px-5 pt-[max(0.85rem,env(safe-area-inset-top))] md:pt-[1.6rem]">
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
