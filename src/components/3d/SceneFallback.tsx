"use client";

/**
 * What the stage shows when WebGL is unavailable or the renderer drops its
 * context: a drawn DoDream cane rather than an empty screen. The story, the
 * copy and the waitlist all keep working around it.
 */
export function SceneFallback() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 620"
        className="h-[68vh] max-h-[620px] w-auto opacity-90 drop-shadow-[0_30px_60px_rgba(0,0,0,0.18)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dd-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c9c6bf" />
            <stop offset="26%" stopColor="#fbfaf7" />
            <stop offset="62%" stopColor="#eceae4" />
            <stop offset="100%" stopColor="#c2bfb8" />
          </linearGradient>
          <linearGradient id="dd-grip" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c0bdb5" />
            <stop offset="30%" stopColor="#efedE7" />
            <stop offset="70%" stopColor="#e0ddd5" />
            <stop offset="100%" stopColor="#b6b3ac" />
          </linearGradient>
          <linearGradient id="dd-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7d7b77" />
            <stop offset="30%" stopColor="#c8c6c1" />
            <stop offset="65%" stopColor="#a2a09b" />
            <stop offset="100%" stopColor="#75736f" />
          </linearGradient>
          <radialGradient id="dd-halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgb(var(--stage-accent))" stopOpacity="0.14" />
            <stop offset="100%" stopColor="rgb(var(--stage-accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="120" cy="300" rx="118" ry="228" fill="url(#dd-halo)" />

        {/* Body — one straight, slender run from grip to lower module */}
        <rect x="110" y="96" width="21" height="484" fill="url(#dd-body)" />
        <rect x="109" y="530" width="23" height="50" rx="2" fill="url(#dd-body)" />

        {/* Textured grip under the cap */}
        <rect x="109" y="60" width="23" height="92" rx="2" fill="url(#dd-grip)" />

        {/* Brushed cap */}
        <path
          d="M108 76 V56a12.5 12.5 0 0 1 25 0v20z"
          fill="url(#dd-metal)"
        />
        <rect x="108" y="74" width="25" height="2.4" fill="#8d8b86" opacity="0.55" />

        {/* Front sensor and control */}
        <circle cx="120.5" cy="192" r="9" fill="#b9b7b2" />
        <circle cx="120.5" cy="192" r="6.6" fill="#0a0a0c" />
        <circle cx="118.6" cy="189.6" r="1.9" fill="#3d3d45" />
        <circle cx="120.5" cy="210" r="1.3" fill="#22222a" />
        <circle cx="120.5" cy="226" r="6.4" fill="#e6e3dc" />
        <circle
          cx="120.5"
          cy="226"
          r="2.4"
          fill="none"
          stroke="#25252b"
          strokeWidth="0.9"
        />

        {/* Lower module: service port, seam and rounded metal tip */}
        <rect x="115" y="542" width="9.5" height="22" rx="4.75" fill="#1c1c1f" />
        <rect x="109" y="578" width="23" height="4" fill="#1c1c1f" />
        <path
          d="M109.5 582h22v6a11 11 0 0 1-22 0z"
          fill="url(#dd-metal)"
        />

        <ellipse
          cx="120"
          cy="600"
          rx="46"
          ry="7"
          fill="rgb(var(--stage-ink))"
          opacity="0.1"
        />
      </svg>
    </div>
  );
}
