/**
 * The scenario the guardian prototype plays out.
 *
 * The place is real: 서울숲, the park in Seongdong-gu, Seoul. The coordinates
 * below run roughly 400 metres east through the open park interior, starting
 * near the main entrance by 서울숲역. They stay inside the park's own grounds
 * — the Han River is well to the south and 왕십리로 well to the west — so the
 * walk never crosses water, a road or a building.
 *
 * One honest note: the polyline is authored against the park's real bounds
 * rather than snapped to a routing service's path geometry, because the
 * prototype has no routing API behind it. It is a real place and a plausible
 * walk through it, not a GPS trace.
 *
 * Nothing here is connected to a device. No cane reports these positions and
 * no notification leaves the browser; the whole scenario is simulated, which
 * the experience page says out loud.
 */

import { measureRoute, type LatLng } from "./geo";

export const GUARDIAN_PLACE = {
  /** Shown in the interface, and it is the actual name of the park. */
  name: "서울숲",
  district: "서울 성동구",
  /** The park's own coordinate, used as the opening camera centre. */
  centre: { lat: 37.5443, lng: 127.0374 } as LatLng,
} as const;

/** East through the park interior from the main entrance plaza. */
export const GUARDIAN_ROUTE_POINTS: readonly LatLng[] = [
  { lat: 37.5447, lng: 127.0372 },
  { lat: 37.54452, lng: 127.0379 },
  { lat: 37.5443, lng: 127.0386 },
  { lat: 37.544, lng: 127.03925 },
  { lat: 37.54368, lng: 127.03975 },
  { lat: 37.5434, lng: 127.0402 },
  { lat: 37.5431, lng: 127.0406 },
  { lat: 37.54285, lng: 127.04105 },
] as const;

export const GUARDIAN_ROUTE = measureRoute(GUARDIAN_ROUTE_POINTS);

export const GUARDIAN = {
  walker: "김영수",
  device: { connection: "연결됨", battery: 78 },
} as const;

/**
 * How long the simulated walk takes to cross the whole route, in seconds.
 *
 * The route measures 402m, so this is a hair over 1 m/s — about 3.6 km/h,
 * which is an ordinary unhurried walking pace. Running the demo faster made
 * the marker cover the park at nearly 10 km/h, which is a sprint, and the one
 * thing this simulation cannot afford is movement a viewer reads as fake.
 * Simulated time therefore runs 1:1 with real time.
 */
export const WALK_DURATION_S = 400;

export const GUARDIAN_COPY = {
  safe: {
    eyebrow: "현재 상태",
    status: "안전하게 이동 중",
    updated: "방금 전",
  },
  fall: {
    eyebrow: "긴급 알림",
    status: "위험 상황이 감지되었습니다",
    body: "김영수님의 현재 위치를 확인해 주세요.",
  },
  /* The message that arrives in the conversation. */
  chat: {
    sender: "두드림",
    lead: "김영수님의 현재 위치에서",
    body: "위험 상황이 감지되었습니다.",
  },
  /* The same event as a system notification. */
  push: {
    app: "카카오톡",
    sender: "두드림",
    title: "위험 상황이 감지되었습니다.",
    body: "김영수님의 현재 위치를 확인해 주세요.",
    at: "지금",
  },
} as const;

/**
 * Status colours. Muted on purpose — a saturated green or a flashing red
 * reads as a game, and this is something a family member is meant to trust.
 * The alert tone is the one the waitlist form already uses for validation
 * errors, so no new colour enters the system.
 */
export const GUARDIAN_TONE = {
  safe: "#4f7a5c",
  alert: "#b4472f",
} as const;
