/**
 * The DoDream story is a single scene told in six chapters. Every part of the
 * experience — copy, chrome, background colour and the 3D choreography — is
 * indexed off this list, so a chapter is added or reordered in one place.
 */

export type ChapterId =
  | "hero"
  | "product"
  | "explore"
  | "technology"
  | "vision"
  | "waitlist";

export type StageMood = {
  /** Page background. */
  background: string;
  /** Secondary stop used for the ambient radial wash. */
  backgroundAccent: string;
  /** Foreground ink as an "r g b" triplet, consumed via rgb(var(--stage-ink)). */
  ink: string;
  /** Hairline/border ink triplet. */
  line: string;
  /** Accent triplet. */
  accent: string;
  /** Light or dark chrome — drives the browser colour scheme hint. */
  scheme: "light" | "dark";
  /**
   * Studio lighting mood for the WebGL stage. Kept next to the CSS values so
   * the product never looks lit for the wrong room.
   */
  light: {
    /** Key light intensity multiplier. */
    key: number;
    /** Ambient fill intensity. */
    fill: number;
    /** Environment (reflection) intensity. */
    env: number;
    /** Ground contact shadow opacity. */
    contact: number;
  };
};

export type Chapter = {
  id: ChapterId;
  /** Index on the choreography timeline. */
  index: number;
  /** Section label used by assistive tech and the progress rail. */
  label: string;
  /** Shown in the top navigation, when present. */
  navLabel?: string;
  mood: StageMood;
};

const PAPER: StageMood = {
  background: "#f4f3f0",
  backgroundAccent: "#e5e2da",
  ink: "16 16 18",
  line: "16 16 18",
  accent: "163 105 68",
  scheme: "light",
  light: { key: 1, fill: 0.85, env: 1, contact: 0.5 },
};

const PAPER_DEEP: StageMood = {
  ...PAPER,
  background: "#ecebe6",
  backgroundAccent: "#dcd8ce",
  light: { key: 1.05, fill: 0.8, env: 1.05, contact: 0.6 },
};

const STUDIO: StageMood = {
  background: "#141417",
  backgroundAccent: "#26262c",
  ink: "244 243 240",
  line: "244 243 240",
  accent: "208 155 116",
  scheme: "dark",
  light: { key: 1.35, fill: 0.45, env: 0.9, contact: 0.42 },
};

const NIGHT: StageMood = {
  ...STUDIO,
  background: "#0b0b0c",
  backgroundAccent: "#191920",
  light: { key: 1.25, fill: 0.38, env: 0.85, contact: 0.34 },
};

const NIGHT_OPEN: StageMood = {
  ...STUDIO,
  background: "#0d0d0f",
  backgroundAccent: "#232330",
  light: { key: 1.45, fill: 0.5, env: 1.1, contact: 0.3 },
};

export const CHAPTERS: readonly Chapter[] = [
  { id: "hero", index: 0, label: "소개", mood: PAPER },
  {
    id: "product",
    index: 1,
    label: "지팡이를 다시 생각했습니다",
    navLabel: "제품",
    mood: PAPER_DEEP,
  },
  { id: "explore", index: 2, label: "당신을 중심으로", mood: STUDIO },
  {
    id: "technology",
    index: 3,
    label: "기술",
    navLabel: "기술",
    mood: NIGHT,
  },
  {
    id: "vision",
    index: 4,
    label: "비전",
    navLabel: "비전",
    mood: NIGHT_OPEN,
  },
  { id: "waitlist", index: 5, label: "관심 등록", mood: PAPER },
] as const;;

export const LAST_CHAPTER = CHAPTERS.length - 1;

export const NAV_LINKS = CHAPTERS.filter((chapter) => chapter.navLabel).map(
  (chapter) => ({ id: chapter.id, label: chapter.navLabel as string }),
);

export function chapterAt(index: number): Chapter {
  const clamped = Math.max(0, Math.min(LAST_CHAPTER, Math.round(index)));
  return CHAPTERS[clamped];
}
