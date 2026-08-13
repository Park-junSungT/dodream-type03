import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const display = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const description =
  "DoDream is reimagining the everyday cane with intelligent technology designed around the way people move.";

export const metadata: Metadata = {
  metadataBase: new URL("https://dodream.example"),
  title: {
    default: "DoDream — A smarter way to move.",
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
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
