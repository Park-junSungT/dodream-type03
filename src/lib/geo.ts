/**
 * The small amount of geography the guardian prototype needs.
 *
 * Web Mercator is what every raster tile service is cut to, so working in it
 * directly means a latitude/longitude can be turned into a pixel on screen
 * without a mapping library riding along for the trip.
 */

export type LatLng = { lat: number; lng: number };

export const TILE_SIZE = 256;

/** World pixel X at a given zoom. One world is TILE_SIZE * 2^zoom wide. */
export function lngToWorldX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * TILE_SIZE * 2 ** zoom;
}

/** World pixel Y at a given zoom. */
export function latToWorldY(lat: number, zoom: number) {
  const rad = (lat * Math.PI) / 180;
  const merc = Math.log(Math.tan(rad) + 1 / Math.cos(rad));
  return (0.5 - merc / (2 * Math.PI)) * TILE_SIZE * 2 ** zoom;
}

export function project(point: LatLng, zoom: number) {
  return { x: lngToWorldX(point.lng, zoom), y: latToWorldY(point.lat, zoom) };
}

const EARTH_RADIUS_M = 6_371_000;

/** Great-circle distance in metres. */
export function distance(a: LatLng, b: LatLng) {
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLng = (b.lng - a.lng) * toRad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(s));
}

/**
 * A route measured once, so a position can be asked for by "how far along"
 * rather than "which segment".
 */
export type MeasuredRoute = {
  points: readonly LatLng[];
  /** Cumulative metres at each point. */
  marks: number[];
  totalMetres: number;
};

export function measureRoute(points: readonly LatLng[]): MeasuredRoute {
  const marks = [0];
  for (let i = 1; i < points.length; i += 1) {
    marks.push(marks[i - 1] + distance(points[i - 1], points[i]));
  }
  return { points, marks, totalMetres: marks[marks.length - 1] };
}

/**
 * The position `t` of the way along the route, 0 to 1.
 *
 * It walks the actual segments rather than blending the endpoints, which is
 * what keeps the marker on the path instead of cutting the corner across
 * whatever the path was going around.
 */
export function pointAt(route: MeasuredRoute, t: number): LatLng {
  const clamped = Math.max(0, Math.min(1, t));
  const target = clamped * route.totalMetres;

  for (let i = 1; i < route.marks.length; i += 1) {
    if (target > route.marks[i]) continue;
    const span = route.marks[i] - route.marks[i - 1];
    const local = span === 0 ? 0 : (target - route.marks[i - 1]) / span;
    const a = route.points[i - 1];
    const b = route.points[i];
    return {
      lat: a.lat + (b.lat - a.lat) * local,
      lng: a.lng + (b.lng - a.lng) * local,
    };
  }
  return route.points[route.points.length - 1];
}

/** The part of the route already walked, ending exactly at the position. */
export function walkedPath(route: MeasuredRoute, t: number): LatLng[] {
  const clamped = Math.max(0, Math.min(1, t));
  const target = clamped * route.totalMetres;
  const out: LatLng[] = [];
  for (let i = 0; i < route.points.length; i += 1) {
    if (route.marks[i] > target) break;
    out.push(route.points[i]);
  }
  const head = pointAt(route, clamped);
  const last = out[out.length - 1];
  if (!last || last.lat !== head.lat || last.lng !== head.lng) out.push(head);
  return out;
}
