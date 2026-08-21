"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GuardianMapView } from "./GuardianMapView";
import { pointAt, walkedPath, type LatLng } from "@/lib/geo";
import {
  GUARDIAN,
  GUARDIAN_COPY,
  GUARDIAN_PLACE,
  GUARDIAN_ROUTE,
  GUARDIAN_ROUTE_POINTS,
  GUARDIAN_TONE,
  WALK_DURATION_S,
} from "@/lib/guardian-route";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Phase = "safe" | "fall";

/** 10:41 plus however far along the three-minute walk we are. */
const START_MINUTE = 10 * 60 + 41;
function clockAt(t: number) {
  const minute = START_MINUTE + Math.floor(t * (WALK_DURATION_S / 60));
  const hh = String(Math.floor(minute / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Start a little way in, so there is a walked path behind him immediately. */
const START_T = 0.12;

export function GuardianExperience() {
  const reduced = useReducedMotion();

  const tRef = useRef(START_T);
  const frozenRef = useRef(false);
  const cameraRef = useRef<LatLng>(pointAt(GUARDIAN_ROUTE, START_T));
  const pushTimer = useRef<number | null>(null);

  const [walk, setWalk] = useState({
    t: START_T,
    camera: pointAt(GUARDIAN_ROUTE, START_T),
  });
  const [phase, setPhase] = useState<Phase>("safe");
  const [incidentAt, setIncidentAt] = useState<string | null>(null);
  const [pushVisible, setPushVisible] = useState(false);

  /*
   * One loop drives both the walk and the camera. The camera eases toward the
   * position rather than being pinned to it, so the map slides instead of
   * snapping and the marker drifts a little off centre the way it does in a
   * real tracking app. State is written at about 20fps — walking is slow, and
   * re-rendering the tree every frame buys nothing a reader can see.
   */
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    let since = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!frozenRef.current) {
        tRef.current = Math.min(1, tRef.current + dt / WALK_DURATION_S);
      }

      const here = pointAt(GUARDIAN_ROUTE, tRef.current);
      const c = cameraRef.current;
      const k = 1 - Math.exp(-2.2 * dt);
      cameraRef.current = {
        lat: c.lat + (here.lat - c.lat) * k,
        lng: c.lng + (here.lng - c.lng) * k,
      };

      since += dt;
      if (since >= 0.05) {
        since = 0;
        setWalk({ t: tRef.current, camera: cameraRef.current });
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  useEffect(
    () => () => {
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    },
    [],
  );

  const trigger = useCallback(() => {
    if (pushTimer.current) window.clearTimeout(pushTimer.current);

    if (phase === "fall") {
      frozenRef.current = false;
      setPhase("safe");
      setIncidentAt(null);
      setPushVisible(false);
      return;
    }

    // The fall happens where he is now — the position on screen becomes the
    // incident, which is the whole point of simulating the walk first.
    frozenRef.current = true;
    setIncidentAt(clockAt(tRef.current));
    setPhase("fall");
    setPushVisible(false);
    pushTimer.current = window.setTimeout(
      () => setPushVisible(true),
      reduced ? 120 : 1100,
    );
  }, [phase, reduced]);

  const position = pointAt(GUARDIAN_ROUTE, walk.t);
  const walked = walkedPath(GUARDIAN_ROUTE, walk.t);
  const tone = phase === "fall" ? GUARDIAN_TONE.alert : GUARDIAN_TONE.safe;
  const copy = phase === "fall" ? GUARDIAN_COPY.fall : GUARDIAN_COPY.safe;
  const clock = incidentAt ?? clockAt(walk.t);

  return (
    <div className="flex h-svh min-h-0 flex-col md:h-auto md:min-h-svh md:items-center md:justify-center md:py-10">
      {/* Page chrome. The phone is the only thing on screen that matters. */}
      <div className="hidden md:mb-9 md:block md:text-center">
        <Link
          href="/"
          className="font-display text-[1.0625rem] font-medium tracking-[-0.02em]"
        >
          두드림
        </Link>
        <p className="lede mx-auto mt-3 text-[0.9375rem]">
          보호자 앱을 미리 경험해 보세요.
        </p>
      </div>

      {/*
       * The handset, from `md` up only. On a phone the app takes the whole
       * viewport instead, because a phone drawn inside a phone is a mockup
       * rather than a product.
       */}
      <div
        /*
         * Width is driven by the height left over after the caption and the
         * heading, because the handset is 9:19.5 and a fixed width runs the
         * disclaimer off the bottom of a 900px screen. The floor keeps the app
         * readable on a short laptop and lets the page scroll instead.
         */
        className="relative flex min-h-0 flex-1 flex-col md:h-auto md:min-h-0 md:w-[clamp(17rem,calc((100svh-16rem)/2.167),20.5rem)] md:flex-none md:rounded-[2.6rem] md:p-[0.6rem] md:shadow-[0_2px_2px_rgba(255,255,255,0.22)_inset,0_30px_70px_-24px_rgba(0,0,0,0.55),0_10px_24px_-14px_rgba(0,0,0,0.4)]"
        style={{ ["--dd-frame" as string]: "linear-gradient(150deg,#3a3d44,#1b1c21 42%,#26282e)" }}
      >
        <div className="pointer-events-none absolute inset-0 hidden rounded-[2.6rem] md:block" style={{ background: "var(--dd-frame)" }} />

        {/* Side keys. */}
        <span aria-hidden="true" className="absolute -left-[2px] top-[7.2rem] hidden h-9 w-[3px] rounded-l-sm bg-[#15161a] md:block" />
        <span aria-hidden="true" className="absolute -left-[2px] top-[9.6rem] hidden h-14 w-[3px] rounded-l-sm bg-[#15161a] md:block" />
        <span aria-hidden="true" className="absolute -right-[2px] top-[8.6rem] hidden h-16 w-[3px] rounded-r-sm bg-[#15161a] md:block" />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:aspect-[9/19.5] md:flex-none md:rounded-[2.05rem]">
          <GuardianScreen
            phase={phase}
            copy={copy}
            tone={tone}
            clock={clock}
            camera={walk.camera}
            position={position}
            walked={walked}
            reduced={reduced}
            pushVisible={pushVisible}
            onTrigger={trigger}
          />

          {/* Camera island, sitting over the top of the display. */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[0.55rem] hidden h-[1.35rem] w-[5.2rem] -translate-x-1/2 rounded-full bg-[#0d0e11] md:block"
          >
            <span className="absolute right-[0.55rem] top-1/2 block h-[0.42rem] w-[0.42rem] -translate-y-1/2 rounded-full bg-[#1d2733]" />
          </span>

          {/* A single soft highlight, for glass rather than gloss. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden md:block"
            style={{
              background:
                "linear-gradient(158deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 22%, transparent 46%)",
            }}
          />
        </div>
      </div>

      <p className="hidden text-center text-[0.6875rem] leading-relaxed text-faint md:mt-7 md:block md:max-w-[26rem]">
        시뮬레이션된 제품 시연입니다. 실제 지팡이나 알림 서비스와 연결되어 있지
        않으며, 위치와 상태는 모두 예시 데이터입니다.
      </p>
    </div>
  );
}

function GuardianScreen({
  phase,
  copy,
  tone,
  clock,
  camera,
  position,
  walked,
  reduced,
  pushVisible,
  onTrigger,
}: {
  phase: Phase;
  copy: { eyebrow: string; status: string; body?: string; updated?: string };
  tone: string;
  clock: string;
  camera: LatLng;
  position: LatLng;
  walked: readonly LatLng[];
  reduced: boolean;
  pushVisible: boolean;
  onTrigger: () => void;
}) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ backgroundColor: "var(--stage-bg)" }}
    >
      {/* Status bar. */}
      <div className="flex flex-none items-center justify-between px-5 pt-[max(0.85rem,env(safe-area-inset-top))] md:pt-[1.65rem]">
        <span className="text-[0.6875rem] font-medium tabular-nums">{clock}</span>
        <Link
          href="/"
          className="-mr-1 rounded-full px-1.5 py-1 text-[0.6875rem] text-faint transition-colors hover:text-[rgb(var(--stage-ink))] md:hidden"
        >
          나가기
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <p className="flex-none font-display text-[1.0625rem] font-medium tracking-[-0.02em]">
          두드림
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phase}
            className="flex-none"
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -5 }}
            transition={{ duration: reduced ? 0.12 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="mt-4 text-[0.6875rem] font-medium tracking-[0.14em]"
              style={{
                color: phase === "fall" ? tone : "rgb(var(--stage-ink) / 0.45)",
              }}
            >
              {phase === "fall"
                ? copy.eyebrow
                : `${GUARDIAN.walker}님의 ${copy.eyebrow}`}
            </p>
            <h1 className="mt-2 flex items-center gap-2.5 font-display text-[1.3125rem] font-medium leading-snug tracking-[-0.03em]">
              <span
                aria-hidden="true"
                className="block h-2 w-2 flex-none rounded-full"
                style={{ backgroundColor: tone, boxShadow: `0 0 0 3px ${tone}22` }}
              />
              {copy.status}
            </h1>
            {phase === "fall" && copy.body ? (
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-soft">
                {copy.body}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* The map is the body of the screen, so it takes the spare height. */}
        <div
          className="mt-4 min-h-[9rem] flex-1 overflow-hidden rounded-2xl border"
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
          <div>
            <p className="text-[0.6875rem] text-faint">현재 위치</p>
            <p className="mt-1 text-[0.875rem] leading-tight">
              {GUARDIAN_PLACE.name}
              <span className="text-faint"> · {GUARDIAN_PLACE.district}</span>
            </p>
          </div>
          <p className="flex-none text-[0.6875rem] text-faint">
            {phase === "fall" ? `감지 ${clock}` : GUARDIAN_COPY.safe.updated}
          </p>
        </div>

        <AnimatePresence initial={false}>
          {phase === "fall" && pushVisible ? (
            <motion.div
              key="push"
              className="mt-3.5 flex-none"
              initial={{ opacity: 0, y: reduced ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.12 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="rounded-2xl border p-3"
                style={{
                  borderColor: "rgb(var(--stage-line) / 0.12)",
                  backgroundColor: "rgb(var(--stage-ink) / 0.03)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="block h-4 w-4 flex-none rounded-[0.3rem]"
                    style={{ backgroundColor: "#f2e14c" }}
                  />
                  <span className="text-[0.6875rem] text-faint">
                    {GUARDIAN_COPY.push.app} · {GUARDIAN_COPY.push.at}
                  </span>
                </div>
                <p className="mt-1.5 text-[0.8125rem] font-medium">
                  {GUARDIAN_COPY.push.sender}
                </p>
                <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-soft">
                  {GUARDIAN_COPY.push.title}
                  <br />
                  {GUARDIAN_COPY.push.body}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {phase === "safe" ? (
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
        ) : null}

        <button
          type="button"
          onClick={onTrigger}
          className="btn btn-ghost btn-sm mt-3.5 w-full flex-none"
        >
          {phase === "fall" ? "정상 상태로 돌아가기" : "낙상 상황 체험하기"}
        </button>

        {/*
          On a phone the app is the whole viewport, so the caption that sits
          under the handset on desktop has nowhere to go. It says so in here
          instead — a reader should never be able to reach the emergency
          screen without having been told none of it is real.
        */}
        <p className="mt-2.5 flex-none text-center text-[0.625rem] leading-relaxed text-faint md:hidden">
          시뮬레이션된 시연입니다. 실제 기기·알림과 연결되어 있지 않습니다.
        </p>
      </div>
    </div>
  );
}
