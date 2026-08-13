"use client";

import { useEffect } from "react";
import { CHAPTERS, LAST_CHAPTER } from "@/lib/story";
import { experience, motion } from "@/lib/experience-store";
import { layoutFromWidth } from "@/lib/quality";

/**
 * The single source of scroll truth.
 *
 * Measures where each chapter sits in the document, converts scroll position
 * into a continuous position on the chapter axis, and publishes it to:
 *   • `motion` — read by the render loop, never through React
 *   • the experience store — only when a discrete value actually changes
 *   • CSS custom properties — so copy, chrome and the page background cross
 *     fade in lockstep with the 3D lighting
 *
 * One rAF-throttled listener drives all three, and it stops scheduling work
 * the moment scrolling stops.
 */
export function StageDriver() {
  useEffect(() => {
    const root = document.documentElement;
    const moods = CHAPTERS.map((chapter) => ({
      background: hexToRgb(chapter.mood.background),
      backgroundAccent: hexToRgb(chapter.mood.backgroundAccent),
      ink: parseTriplet(chapter.mood.ink),
      line: parseTriplet(chapter.mood.line),
      accent: parseTriplet(chapter.mood.accent),
      scheme: chapter.mood.scheme,
    }));

    const anchors: number[] = new Array(CHAPTERS.length).fill(0);
    let frame = 0;
    let lastChapter = -1;
    let lastExploring: boolean | null = null;
    let lastScheme = "";

    const measure = () => {
      const viewportHeight = window.innerHeight;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - viewportHeight,
      );

      CHAPTERS.forEach((chapter, index) => {
        const element = document.getElementById(chapter.id);
        if (!element) {
          anchors[index] = (index / LAST_CHAPTER) * maxScroll;
          return;
        }
        const rect = element.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        // The scroll position at which this chapter is centred on screen.
        anchors[index] = top + rect.height / 2 - viewportHeight / 2;
      });

      // Keep the axis strictly increasing and inside the scrollable range,
      // clamping from both ends so short pages still resolve every chapter.
      anchors[LAST_CHAPTER] = Math.min(anchors[LAST_CHAPTER], maxScroll);
      for (let i = LAST_CHAPTER - 1; i >= 0; i -= 1) {
        anchors[i] = Math.min(anchors[i], anchors[i + 1] - 1);
      }
      anchors[0] = Math.max(anchors[0], 0);
      for (let i = 1; i <= LAST_CHAPTER; i += 1) {
        anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
      }

      motion.layout = layoutFromWidth(window.innerWidth);
    };

    const axisFromScroll = (scrollY: number) => {
      if (scrollY <= anchors[0]) return 0;
      if (scrollY >= anchors[LAST_CHAPTER]) return LAST_CHAPTER;
      for (let i = 0; i < LAST_CHAPTER; i += 1) {
        if (scrollY >= anchors[i] && scrollY <= anchors[i + 1]) {
          const span = anchors[i + 1] - anchors[i];
          return i + (scrollY - anchors[i]) / span;
        }
      }
      return LAST_CHAPTER;
    };

    const update = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      motion.scroll = Math.min(1, Math.max(0, scrollY / maxScroll));
      const axis = axisFromScroll(scrollY);
      motion.chapterAxis = axis;

      // --- Discrete state ------------------------------------------------
      const chapter = Math.max(0, Math.min(LAST_CHAPTER, Math.round(axis)));
      if (chapter !== lastChapter) {
        lastChapter = chapter;
        experience.setChapter(chapter);
      }

      const exploring = axis > 1.72 && axis < 2.55;
      if (exploring !== lastExploring) {
        lastExploring = exploring;
        experience.setExploring(exploring);
      }

      // --- Stage colours ---------------------------------------------------
      const lower = Math.floor(axis);
      const upper = Math.min(LAST_CHAPTER, lower + 1);
      const t = axis - lower;
      const a = moods[lower];
      const b = moods[upper];

      /*
       * A light chapter next to a dark one has to cross mid-grey, where dark
       * ink and a grey ground would both be washed out. So the two travel on
       * different curves: the ground dissolves over the middle half of the
       * transition, and the ink flips through a narrow band at its centre —
       * always landing on the side with the contrast.
       */
      const ground = smoothstep((t - 0.25) / 0.5);
      const ink = smoothstep((t - 0.42) / 0.16);

      root.style.setProperty(
        "--stage-bg",
        mixRgb(a.background, b.background, ground),
      );
      root.style.setProperty(
        "--stage-bg-accent",
        mixRgb(a.backgroundAccent, b.backgroundAccent, ground),
      );
      root.style.setProperty("--stage-ink", mixTriplet(a.ink, b.ink, ink));
      root.style.setProperty("--stage-line", mixTriplet(a.line, b.line, ink));
      root.style.setProperty(
        "--stage-accent",
        mixTriplet(a.accent, b.accent, ink),
      );

      const scheme = t < 0.5 ? a.scheme : b.scheme;
      if (scheme !== lastScheme) {
        lastScheme = scheme;
        root.style.setProperty("color-scheme", scheme);
        root.dataset.stage = scheme;
        const meta = document.querySelector('meta[name="theme-color"]');
        meta?.setAttribute(
          "content",
          scheme === "dark"
            ? CHAPTERS[upper].mood.background
            : CHAPTERS[lower].mood.background,
        );
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    update();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    // Section heights settle after fonts land and images decode.
    const settle = window.setTimeout(onResize, 400);
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.clearTimeout(settle);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

type Rgb = [number, number, number];

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function parseTriplet(triplet: string): Rgb {
  const parts = triplet.split(/\s+/).map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function mix(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function mixRgb(a: Rgb, b: Rgb, t: number) {
  return `rgb(${mix(a[0], b[0], t)} ${mix(a[1], b[1], t)} ${mix(a[2], b[2], t)})`;
}

function mixTriplet(a: Rgb, b: Rgb, t: number) {
  return `${mix(a[0], b[0], t)} ${mix(a[1], b[1], t)} ${mix(a[2], b[2], t)}`;
}
