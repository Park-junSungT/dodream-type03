"use client";

import { useEffect, useRef, useState } from "react";
import {
  TILE_SIZE,
  lngToWorldX,
  latToWorldY,
  type LatLng,
} from "@/lib/geo";

/**
 * A real map, drawn from raster tiles.
 *
 * Tiles are cut to Web Mercator, so a latitude and longitude becomes a pixel
 * with two lines of arithmetic and the route can be laid straight over the
 * real roads underneath — no mapping library, no second canvas, and the
 * overlay stays in the site's own visual language.
 *
 * The tile source is an environment variable so this can be pointed at a
 * Korean provider; it defaults to OpenStreetMap, which needs no key and
 * carries real Korean road, park and place data. Attribution is required by
 * the licence and is rendered below.
 */

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? "© OpenStreetMap contributors";

export const MAP_ZOOM = 17;

export function GuardianMapView({
  centre,
  route,
  walked,
  position,
  tone,
  reduced,
}: {
  centre: LatLng;
  route: readonly LatLng[];
  walked: readonly LatLng[];
  position: LatLng;
  tone: string;
  reduced: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () =>
      setSize({ w: host.clientWidth, h: host.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const { w, h } = size;
  const originX = lngToWorldX(centre.lng, MAP_ZOOM) - w / 2;
  const originY = latToWorldY(centre.lat, MAP_ZOOM) - h / 2;

  /*
   * Tiles are laid on whole pixels and the leftover fraction is carried by a
   * transform on the layer above them.
   *
   * Placing each tile at its true fractional offset is what tore the map: the
   * browser rounds every image independently, so neighbours land a fraction
   * apart and a hairline of the background shows through every seam — a cross
   * straight down the middle of a 2x2 grid. Integers make the grid exact, and
   * the sub-pixel remainder moves to a single composited transform where it
   * shifts the whole sheet at once instead of pulling it apart.
   */
  const baseX = Math.floor(originX);
  const baseY = Math.floor(originY);
  const fracX = originX - baseX;
  const fracY = originY - baseY;

  const toScreen = (point: LatLng) => ({
    x: lngToWorldX(point.lng, MAP_ZOOM) - originX,
    y: latToWorldY(point.lat, MAP_ZOOM) - originY,
  });

  const tiles: { key: string; url: string; left: number; top: number }[] = [];
  if (w > 0 && h > 0) {
    const span = 2 ** MAP_ZOOM;
    const minX = Math.floor(originX / TILE_SIZE);
    const maxX = Math.floor((originX + w) / TILE_SIZE) + 1;
    const minY = Math.floor(originY / TILE_SIZE);
    const maxY = Math.floor((originY + h) / TILE_SIZE) + 1;
    for (let ty = minY; ty <= maxY; ty += 1) {
      if (ty < 0 || ty >= span) continue;
      for (let tx = minX; tx <= maxX; tx += 1) {
        const wrapped = ((tx % span) + span) % span;
        tiles.push({
          key: `${tx}/${ty}`,
          url: TILE_URL.replace("{z}", String(MAP_ZOOM))
            .replace("{x}", String(wrapped))
            .replace("{y}", String(ty)),
          left: tx * TILE_SIZE - baseX,
          top: ty * TILE_SIZE - baseY,
        });
      }
    }
  }

  const line = (points: readonly LatLng[]) =>
    points.map((p) => { const s = toScreen(p); return `${s.x},${s.y}`; }).join(" ");

  const here = toScreen(position);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Ground under the tiles, so a slow or blocked tile never flashes white. */}
      <div
        ref={hostRef}
        className="absolute inset-0"
        style={{ backgroundColor: "rgb(var(--stage-ink) / 0.05)" }}
      >
        {/*
         * Pulled towards the page's neutrals. Enough to sit inside the DoDream
         * palette, not so much that a road stops looking like a road.
         */}
        <div
          className="absolute inset-0"
          style={{
            filter: "saturate(0.6) contrast(0.94) brightness(1.04)",
            transform: `translate3d(${-fracX}px, ${-fracY}px, 0)`,
            willChange: "transform",
          }}
        >
          {tiles.map((tile) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              aria-hidden="true"
              draggable={false}
              width={TILE_SIZE}
              height={TILE_SIZE}
              /*
               * A tile that cannot load leaves a broken-image glyph behind.
               * Hiding it drops the map back to plain ground with the route
               * still drawn over it, which is a far better answer on a poor
               * connection than a grid of little torn-paper icons.
               */
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
              style={{
                position: "absolute",
                left: tile.left,
                top: tile.top,
                width: TILE_SIZE,
                height: TILE_SIZE,
                userSelect: "none",
              }}
            />
          ))}
        </div>
      </div>

      {w > 0 ? (
        <svg
          className="pointer-events-none absolute inset-0"
          width={w}
          height={h}
          role="img"
          aria-label={`${position.lat.toFixed(5)}, ${position.lng.toFixed(5)} 부근, 현재 위치`}
        >
          {/* The rest of the walk, then the part already covered. */}
          <polyline
            points={line(route)}
            fill="none"
            stroke="rgb(16 16 18 / 0.22)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 7"
          />
          <polyline
            points={line(walked)}
            fill="none"
            stroke="rgb(16 16 18 / 0.55)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {reduced ? null : (
            <circle cx={here.x} cy={here.y} r="14" fill={tone} opacity="0.16">
              <animate
                attributeName="r"
                values="8;18;8"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.2;0.02;0.2"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          )}
          <circle cx={here.x} cy={here.y} r="7.5" fill="#ffffff" />
          <circle cx={here.x} cy={here.y} r="5" fill={tone} />
        </svg>
      ) : null}

      <p
        className="pointer-events-none absolute bottom-1 right-1.5 text-[0.5625rem] leading-none"
        style={{ color: "rgb(16 16 18 / 0.42)" }}
      >
        {ATTRIBUTION}
      </p>
    </div>
  );
}
