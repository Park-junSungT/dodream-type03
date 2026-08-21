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

const CHANNELS = [
  { id: "app", label: "보호자 앱" },
  { id: "chat", label: "카카오톡" },
  { id: "lock", label: "알림" },
] as const;
type Channel = (typeof CHANNELS)[number]["id"];

/**
 * One event, shown three ways.
 *
 * The walk, the fall and the clock all live here, and each handset reads the
 * same values — so the person, the place, the minute and the incident are
 * necessarily identical across the three rather than three screens that
 * happen to agree.
 *
 * From `lg` the three sit side by side. Below that only one is on screen at a
 * time behind a switcher, framed down to `md` and taking the whole viewport
 * below it. The guardian app stays mounted either way, so its simulation keeps
 * running while another channel is being looked at.
 */
export function GuardianExperience() {
  const reduced = useReducedMotion();

  const tRef = useRef(START_T);
  const frozenRef = useRef(false);
  const cameraRef = useRef<LatLng>(pointAt(GUARDIAN_ROUTE, START_T));

  const [walk, setWalk] = useState({
    t: START_T,
    camera: pointAt(GUARDIAN_ROUTE, START_T),
  });
  const [incidentAt, setIncidentAt] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel>("app");

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

  const trigger = useCallback(() => {
    if (frozenRef.current) {
      frozenRef.current = false;
      setIncidentAt(null);
      return;
    }
    // The fall happens where he is now, which is why the walk comes first.
    frozenRef.current = true;
    setIncidentAt(clockAt(tRef.current));
  }, []);

  const fallen = incidentAt !== null;
  const clock = incidentAt ?? clockAt(walk.t);
  const position = pointAt(GUARDIAN_ROUTE, walk.t);
  const walked = walkedPath(GUARDIAN_ROUTE, walk.t);

  const screens: Record<Channel, React.ReactNode> = {
    app: (
      <GuardianAppScreen
        clock={clock}
        fallen={fallen}
        camera={walk.camera}
        position={position}
        walked={walked}
        reduced={reduced}
      />
    ),
    chat: <KakaoChatScreen clock={clock} fallen={fallen} reduced={reduced} />,
    lock: <LockScreen clock={clock} fallen={fallen} reduced={reduced} />,
  };

  return (
    <div className="flex h-svh min-h-0 flex-col md:h-auto md:min-h-svh md:items-center md:justify-center md:py-10">
      <div className="hidden flex-none text-center md:mb-8 md:block">
        <Link href="/" className="font-display text-[1.0625rem] font-medium tracking-[-0.02em]">
          두드림
        </Link>
        <p className="lede mx-auto mt-3 text-[0.9375rem]">
          지팡이가 위험을 감지하면, 보호자에게 이렇게 전해집니다.
        </p>
      </div>

      {/*
       * Three across from `lg`. Below that each handset is still rendered —
       * hidden with CSS, never unmounted — so the walk carries on behind the
       * switcher and the three can never drift out of step.
       */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-none lg:flex-row lg:items-start lg:gap-7">
        {CHANNELS.map(({ id, label }) => (
          <PhoneShell
            key={id}
            className={`${channel === id ? "flex" : "hidden"} lg:flex md:w-[min(19rem,calc(100vw-2.5rem))] lg:w-[17.5rem]`}
          >
            {screens[id]}
            <span className="sr-only">{label}</span>
          </PhoneShell>
        ))}
      </div>

      <div className="flex flex-none flex-col items-center gap-3 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 md:pb-0 md:pt-7">
        {/* Channel switcher — only needed while one handset is on screen. */}
        <div
          role="tablist"
          aria-label="알림 채널"
          className="flex w-full max-w-[19rem] flex-none rounded-full p-1 lg:hidden"
          style={{ backgroundColor: "rgb(var(--stage-ink) / 0.055)" }}
        >
          {CHANNELS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={channel === id}
              onClick={() => setChannel(id)}
              className="flex-1 rounded-full px-2 py-1.5 text-[0.75rem] font-medium transition-colors duration-200"
              style={
                channel === id
                  ? { backgroundColor: "var(--stage-bg)", color: "rgb(var(--stage-ink))" }
                  : { color: "rgb(var(--stage-ink) / 0.55)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <button type="button" onClick={trigger} className="btn btn-ghost btn-sm w-full max-w-[19rem]">
          {fallen ? "다시 체험하기" : "낙상 상황 체험하기"}
        </button>

        <p className="max-w-[26rem] text-center text-[0.625rem] leading-relaxed text-faint md:text-[0.6875rem]">
          시뮬레이션된 제품 시연입니다. 실제 지팡이나 알림 서비스와 연결되어 있지
          않으며, 위치와 상태는 모두 예시 데이터입니다.
        </p>
      </div>
    </div>
  );
}
