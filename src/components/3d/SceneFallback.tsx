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
          <linearGradient id="dd-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6f6d68" />
            <stop offset="28%" stopColor="#d8d6d0" />
            <stop offset="55%" stopColor="#a3a09a" />
            <stop offset="100%" stopColor="#5c5a56" />
          </linearGradient>
          <linearGradient id="dd-grip" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1b1b1f" />
            <stop offset="45%" stopColor="#3a3a41" />
            <stop offset="100%" stopColor="#141417" />
          </linearGradient>
          <linearGradient id="dd-copper" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a5535" />
            <stop offset="50%" stopColor="#d3966a" />
            <stop offset="100%" stopColor="#7d4d31" />
          </linearGradient>
          <radialGradient id="dd-halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgb(var(--stage-accent))" stopOpacity="0.16" />
            <stop offset="100%" stopColor="rgb(var(--stage-accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="120" cy="300" rx="120" ry="230" fill="url(#dd-halo)" />

        {/* Swan-neck handle */}
        <path
          d="M104 96 C104 62 128 44 158 46 C186 48 200 66 198 84"
          stroke="url(#dd-grip)"
          strokeWidth="21"
          strokeLinecap="round"
        />
        <path
          d="M104 118 C104 78 126 58 156 60"
          stroke="url(#dd-metal)"
          strokeWidth="15"
          strokeLinecap="round"
        />

        {/* Haptic collar */}
        <rect x="95" y="136" width="18" height="16" rx="4" fill="url(#dd-copper)" />

        {/* Shaft */}
        <path
          d="M104 150 L109 540"
          stroke="url(#dd-metal)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Charge collar */}
        <rect x="96" y="214" width="17" height="20" rx="4" fill="url(#dd-grip)" />
        <circle cx="104" cy="224" r="2.6" fill="#e2a171" />

        {/* Sensor module */}
        <rect x="112" y="286" width="20" height="48" rx="8" fill="url(#dd-grip)" />
        <rect x="118" y="296" width="10" height="16" rx="3" fill="#0b0b0d" />
        <rect x="118" y="316" width="8" height="8" rx="2.5" fill="#0b0b0d" />

        {/* Ground-facing window */}
        <rect x="110" y="452" width="16" height="30" rx="6" fill="url(#dd-grip)" />

        {/* Ferrule + tip */}
        <path
          d="M109 540 L110 560"
          stroke="url(#dd-metal)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M110 562 L110 578"
          stroke="#17171a"
          strokeWidth="22"
          strokeLinecap="round"
        />

        <ellipse
          cx="112"
          cy="596"
          rx="52"
          ry="9"
          fill="rgb(var(--stage-ink))"
          opacity="0.1"
        />
      </svg>
    </div>
  );
}
