"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GuardianMapView } from "./GuardianMapView";
import { DoDreamMark } from "./DoDreamMark";
import { StatusBar } from "./PhoneShell";
import type { LatLng } from "@/lib/geo";
import {
  GUARDIAN,
  GUARDIAN_COPY,
  GUARDIAN_PLACE,
  GUARDIAN_ROUTE_POINTS,
  GUARDIAN_TONE,
} from "@/lib/guardian-route";

/** Phone 1: what the guardian opens. */
export function GuardianAppScreen({
  clock,
  fallen,
  camera,
  position,
  walked,
  reduced,
}: {
  clock: string;
  fallen: boolean;
  camera: LatLng;
  position: LatLng;
  walked: readonly LatLng[];
  reduced: boolean;
}) {
  const tone = fallen ? GUARDIAN_TONE.alert : GUARDIAN_TONE.safe;
  const copy = fallen ? GUARDIAN_COPY.fall : GUARDIAN_COPY.safe;

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ backgroundColor: "var(--stage-bg)" }}>
      <StatusBar clock={clock} />

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <div className="flex flex-none items-center gap-2">
          <DoDreamMark size={22} rounded="0.45rem" />
          <p className="font-display text-[1rem] font-medium tracking-[-0.02em]">두드림</p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={fallen ? "fall" : "safe"}
            className="flex-none"
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -5 }}
            transition={{ duration: reduced ? 0.12 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="mt-4 text-[0.6875rem] font-medium tracking-[0.14em]"
              style={{ color: fallen ? tone : "rgb(var(--stage-ink) / 0.45)" }}
            >
              {fallen ? copy.eyebrow : `${GUARDIAN.walker}님의 ${copy.eyebrow}`}
            </p>
            <h1 className="mt-2 flex items-center gap-2.5 font-display text-[1.25rem] font-medium leading-snug tracking-[-0.03em]">
              <span
                aria-hidden="true"
                className="block h-2 w-2 flex-none rounded-full"
                style={{ backgroundColor: tone, boxShadow: `0 0 0 3px ${tone}22` }}
              />
              {copy.status}
            </h1>
            {fallen ? (
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-soft">
                {GUARDIAN_COPY.fall.body}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div
          className="mt-4 min-h-[8rem] flex-1 overflow-hidden rounded-2xl border"
          style={{ borderColor: "rgb(var(--stage-line) / 0.12)" }}
        >
          <GuardianMapView
            centre={camera}
            route={GUARDIAN_ROUTE_POINTS}
            walked={walked}
            position={position}
            tone={tone}
            reduced={reduced}
          />
        </div>

        <div className="mt-3.5 flex flex-none items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.6875rem] text-faint">현재 위치</p>
            <p className="mt-1 truncate text-[0.875rem] leading-tight">
              {GUARDIAN_PLACE.name}
              <span className="text-faint"> · {GUARDIAN_PLACE.district}</span>
            </p>
          </div>
          <p className="flex-none text-[0.6875rem] text-faint">
            {fallen ? `감지 ${clock}` : GUARDIAN_COPY.safe.updated}
          </p>
        </div>

        <dl className="mt-3.5 flex flex-none items-center justify-between gap-4 border-t pt-3.5 text-[0.8125rem] border-stage">
          <div className="flex items-center gap-2">
            <dt className="text-soft">지팡이 상태</dt>
            <dd>{GUARDIAN.device.connection}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-soft">배터리</dt>
            <dd className="tabular-nums">{GUARDIAN.device.battery}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
