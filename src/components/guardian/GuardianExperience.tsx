"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GuardianAppScreen } from "./GuardianAppScreen";
import { KakaoChatScreen } from "./KakaoChatScreen";
import { LockScreen } from "./LockScreen";
import { PhoneShell } from "./PhoneShell";
import { pointAt, walkedPath, type LatLng } from "@/lib/geo";
import { GUARDIAN_ROUTE, WALK_DURATION_S } from "@/lib/guardian-route";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** 10:41 plus however far along the walk we are. */
const START_MINUTE = 10 * 60 + 41;
function clockAt(t: number) {
  const minute = START_MINUTE + Math.floor(t * (WALK_DURATION_S / 60));
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

/** Start a little way in, so there is a walked path behind him immediately. */
const START_T = 0.12;

/**
 * The page's own ground. A shade warmer than the landing stage, which keeps
 * three dark handsets from reading as holes punched in a cold grey sheet.
 */
const PAGE_BG = "#f1f0ec";

/**
 * The three steps, in the order they happen.
 *
 * `reveals` is the step index at which each handset flips from calm to
 * alerted, which is the whole point of the sequence: the cane's own app knows
 * first, the message goes out second, the phone in a pocket buzzes third.
 */
const STEPS = [
  { id: "app", number: "01", title: "보호자 앱 현재 상태 확인" },
  { id: "chat", number: "02", title: "카카오톡 상황 알림 전달" },
  { id: "lock", number: "03", title: "스마트폰 알림 즉시 확인" },
] as const;

/** How long the alert takes to move from one channel to the next. */
const RELAY_MS = 900;
/** Same sequence for a reader who asked for less motion, just less waiting. */
const RELAY_REDUCED_MS = 320;

const NARRATION = [
  "김영수님이 안전하게 이동 중입니다.",
  "보호자 앱에서 위험 상황이 감지되었습니다.",
  "카카오톡으로 알림이 전달되었습니다.",
  "스마트폰 잠금화면에 알림이 도착했습니다.",
] as const;

/**
 * One event, told three times.
 *
 * The walk, the fall and the clock all live here, and every handset reads the
 * same values — so the person, the place and the minute are necessarily
 * identical across the three rather than three screens that happen to agree.
 *
 * The story reads left to right from `lg` and top to bottom below it, and
 * nothing is ever unmounted: the walk keeps running and the three stay in step
 * whichever way they are stacked.
 */
export function GuardianExperience() {
  const reduced = useReducedMotion();

  const tRef = useRef(START_T);
  const frozenRef = useRef(false);
  const cameraRef = useRef<LatLng>(pointAt(GUARDIAN_ROUTE, START_T));
  const relayRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [walk, setWalk] = useState({
    t: START_T,
    camera: pointAt(GUARDIAN_ROUTE, START_T),
  });
  const [incidentAt, setIncidentAt] = useState<string | null>(null);
  /** 0 calm · 1 the app knows · 2 the message is sent · 3 the phone shows it. */
  const [step, setStep] = useState(0);

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

      // The camera eases toward the walker rather than being pinned to him, so
      // the map slides instead of snapping and he drifts a little off centre.
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

  const clearRelay = useCallback(() => {
    relayRef.current.forEach(clearTimeout);
    relayRef.current = [];
  }, []);

  useEffect(() => clearRelay, [clearRelay]);

  const trigger = useCallback(() => {
    clearRelay();

    if (frozenRef.current) {
      frozenRef.current = false;
      setIncidentAt(null);
      setStep(0);
      return;
    }

    // The fall happens where he is now, which is why the walk comes first.
    frozenRef.current = true;
    setIncidentAt(clockAt(tRef.current));
    setStep(1);

    // Then it travels. Two timers, not one animation: each channel receives
    // the alert on its own beat, the way a relay actually reaches a person.
    const gap = reduced ? RELAY_REDUCED_MS : RELAY_MS;
    relayRef.current = [
      setTimeout(() => setStep(2), gap),
      setTimeout(() => setStep(3), gap * 2),
    ];
  }, [clearRelay, reduced]);

  const clock = incidentAt ?? clockAt(walk.t);
  const position = pointAt(GUARDIAN_ROUTE, walk.t);
  const walked = walkedPath(GUARDIAN_ROUTE, walk.t);

  const screens = {
    app: (
      <GuardianAppScreen
        clock={clock}
        fallen={step >= 1}
        camera={walk.camera}
        position={position}
        walked={walked}
        reduced={reduced}
      />
    ),
    chat: <KakaoChatScreen clock={clock} fallen={step >= 2} reduced={reduced} />,
    lock: <LockScreen clock={clock} fallen={step >= 3} reduced={reduced} />,
  } as const;

  return (
    <div
      className="min-h-svh w-full pb-16 pt-8 sm:pt-12"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="shell flex flex-col items-center">
        <Link
          href="/"
          className="flex-none font-display text-[1.0625rem] font-medium tracking-[-0.02em]"
        >
          두드림
        </Link>

        <header className="mt-8 flex max-w-[38rem] flex-col items-center text-center sm:mt-10">
          {/*
            The break is deliberate at every width. Left to balance itself the
            line landed after "필요한", splitting "필요한 순간" across two rows;
            the comma is where the sentence actually turns.
          */}
          <h1 className="display-md">
            지팡이가 먼저 감지하고,
            <br /> 필요한 순간 보호자에게 알려드립니다.
          </h1>
          <p className="lede mt-5">
            보호자 앱과 카카오톡을 통해 현재 상황을 전달합니다.
          </p>
        </header>

        {/*
          The invitation sits above the story rather than under it. Stacked on
          a phone the three handsets run well past a screen, and a button at
          the very bottom would ask the reader to trigger the event from a
          place where none of it is visible.
        */}
        <div className="mt-9 flex flex-none flex-col items-center gap-3">
          <button
            type="button"
            onClick={trigger}
            className="btn btn-ghost btn-sm min-w-[11.5rem]"
          >
            {step > 0 ? "다시 체험하기" : "낙상 상황 체험하기"}
          </button>
          <p className="text-center text-[0.6875rem] leading-relaxed text-faint">
            실제 제품과 연결되지 않은 시뮬레이션 체험입니다.
          </p>
        </div>

        {/* Announced for a reader who cannot see the three screens change. */}
        <p aria-live="polite" className="sr-only">
          {NARRATION[step]}
        </p>

        <ol className="mt-12 flex w-full flex-col items-center lg:mt-14 lg:flex-row lg:items-start lg:justify-center lg:gap-x-[4.5rem]">
          {STEPS.map(({ id, number, title }, i) => (
            <li
              key={id}
              className="relative flex flex-none flex-col items-center lg:items-start"
            >
              {i > 0 ? <StepLink /> : null}

              <div className="flex flex-col items-center gap-1.5 pb-5 text-center lg:items-start lg:text-left">
                <span
                  className="text-[0.6875rem] font-medium leading-none tabular-nums tracking-[0.18em]"
                  style={{
                    color: `rgb(var(--stage-ink) / ${i === 0 ? 0.55 : 0.38})`,
                  }}
                >
                  {number}
                </span>
                <p
                  className="text-[0.9375rem] font-medium tracking-[-0.02em]"
                  style={{
                    color: `rgb(var(--stage-ink) / ${i === 0 ? 0.92 : 0.72})`,
                  }}
                >
                  {title}
                </p>
              </div>

              <PhoneShell
                emphasis={i === 0}
                className="w-[min(16.5rem,calc(100vw-4rem))] lg:w-[15rem] xl:w-[16.5rem]"
              >
                {screens[id]}
              </PhoneShell>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/**
 * The join between two steps.
 *
 * A hairline and a five-pixel corner, drawn from the same ink as every other
 * rule on the site — enough to say "and then", nothing like an arrow. It runs
 * downward between stacked steps and rightward between side-by-side ones, and
 * on the wide layout it sits up on the label rail so the numbers read as a
 * connected sequence with the handsets hanging beneath them.
 */
function StepLink() {
  const line = "rgb(var(--stage-line) / 0.26)";
  const tip = "rgb(var(--stage-line) / 0.34)";

  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center py-6 lg:absolute lg:left-[-4.5rem] lg:top-[0.3rem] lg:w-[4.5rem] lg:py-0"
    >
      <span
        className="relative block h-10 w-px lg:hidden"
        style={{ background: `linear-gradient(to bottom, transparent, ${line} 40%, ${line} 60%, transparent)` }}
      >
        <span
          className="absolute bottom-0 left-1/2 block h-[5px] w-[5px] -translate-x-1/2 rotate-45 border-b border-r"
          style={{ borderColor: tip }}
        />
      </span>

      <span
        className="relative hidden h-px w-[2.5rem] lg:block"
        style={{ background: `linear-gradient(to right, transparent, ${line} 40%, ${line} 60%, transparent)` }}
      >
        <span
          className="absolute right-0 top-1/2 block h-[5px] w-[5px] -translate-y-1/2 rotate-45 border-r border-t"
          style={{ borderColor: tip }}
        />
      </span>
    </span>
  );
}
