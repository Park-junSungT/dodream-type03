import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const display = Inter_Tight({
  variable: "--font-display-latin",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const sans = Inter({
  variable: "--font-sans-latin",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

/*
 * Inter and Inter Tight carry no Hangul, so Korean copy was falling through to
 * whatever the OS had — Malgun Gothic on Windows, which is why the Korean hero
 * looked nothing like the rest of the brand.
 *
 * This sits *after* the Latin faces in the stack, so Latin glyphs and numerals
 * still come from Inter Tight and only Hangul resolves here. The site's
 * existing typography is unchanged; Korean simply stops being a fallback.
 *
 * Google slices this face by unicode-range, so a reader only ever downloads
 * the handful of slices the page's Hangul actually needs.
 */
const korean = Noto_Sans_KR({
  variable: "--font-korean",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const description =
  "DoDream은 익숙한 지팡이에 스마트 기술을 더해 새로운 이동 경험을 만들어갑니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://dodream.example"),
  title: {
    default: "두드림 — 지팡이를 다시 생각하다",
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
    title: "두드림 — 지팡이를 다시 생각하다",
    description,
    siteName: "DoDream",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "두드림 — 지팡이를 다시 생각하다",
    description,
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
      className={`${display.variable} ${sans.variable} ${korean.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
