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
  "스마트 지팡이";

export const metadata: Metadata = {
  metadataBase: new URL("https://dodream.example"),
  title: {
    default: "두드림",
    template: "%s — DoDream",
  },
  description,
  applicationName: "DoDream",
  keywords: [
    "DoDream",
    "smart cane",
    "assistive technology",
    "mobility",
    "haptic feedback",
  ],
  openGraph: {
    title: "DoDream — A smarter way to move.",
    description,
    siteName: "DoDream",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DoDream — A smarter way to move.",
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
      lang="en"
      className={`${display.variable} ${sans.variable} ${korean.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
