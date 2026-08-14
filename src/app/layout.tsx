import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

/*
 * One face sets the whole site, Latin and Hangul alike.
 *
 * It used to take three: Inter Tight for display, Inter for body, Noto Sans KR
 * for Hangul. That left a seam inside any single word that mixed scripts —
 * "DoDream을" drew its Latin from Inter Tight and its Hangul from Noto, at
 * different weights of colour. Pretendard is drawn on Inter's Latin skeleton
 * and carries Hangul in the same voice, so the seam is gone and the Latin
 * proportions the design was built around are kept.
 *
 * Both files are cut from Pretendard Variable and served from this origin —
 * no request leaves for a font CDN. See scripts/build-pretendard-subset.py for
 * how they are generated and why the face is split in two.
 */
const pretendard = localFont({
  src: "../fonts/PretendardVariable.subset.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
  // The stack below is composed by hand in globals.css, so next/font must not
  // splice an Arial-metric fallback in between the two Pretendard tiers.
  adjustFontFallback: false,
});

/*
 * The rest of KS X 1001, for Hangul the first file does not carry — in
 * practice a reader typing an uncommon name into the waitlist form. It is
 * never preloaded and never fetched unless such a syllable is actually set.
 */
const pretendardKoExt = localFont({
  src: "../fonts/PretendardVariable.ko-ext.woff2",
  variable: "--font-pretendard-ko-ext",
  weight: "45 920",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value: "U+1100-11FF, U+3130-318F, U+A960-A97F, U+AC00-D7A3, U+D7B0-D7FF",
    },
  ],
});

const description = "두드림"
  // "DoDream은 익숙한 지팡이에 스마트 기술을 더해 새로운 이동 경험을 만들어갑니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ddmove.vercel.app/"),
  title: {
    default: "두드림 — 스마트 지팡이",
    template: "%s — 두드림",
  },
  description,
  applicationName: "DoDream",
  keywords: [
    "두드림",
    "DoDream",
    "스마트 지팡이",
    "흰지팡이",
    "보조 기기",
    "시각장애",
    "이동 보조",
  ],
  openGraph: {
    title: "두드림 — 스마트 지팡이",
    description:
      "스마트 기술을 지팡이에 담아, 주변을 먼저 살피고 필요한 정보를 전달합니다.",
    siteName: "두드림",
    locale: "ko_KR",
    type: "website",
    url: "https://ddmove.vercel.app",
    images: [
      {
        url: "/og-image2.png",
        width: 1200,
        height: 630,
        alt: "두드림 스마트 지팡이",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "두드림 — 스마트 지팡이",
    description:
      "스마트 기술을 지팡이에 담아, 주변을 먼저 살피고 필요한 정보를 전달합니다.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f3f0",
  colorScheme: "light",
  // The 3D stage relies on a stable viewport; zoom stays available for a11y.
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${pretendardKoExt.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
