import Image from "next/image";

/**
 * The DoDream mark, in one place.
 *
 * The guardian app header, the KakaoTalk sender avatar and the lock screen app
 * icon all render through here, so the identity is set once.
 *
 * The source file is 1254px square and about 1.3MB; it is drawn at twenty to
 * forty pixels. next/image resizes and re-encodes it per call site, which is
 * the difference between a couple of kilobytes and shipping the full asset to
 * a phone for the sake of an app icon.
 */

const LOGO_SRC = "/logo/logo.png";

export function DoDreamMark({
  size = 40,
  rounded = "0.75rem",
  className = "",
}: {
  size?: number;
  /** Squircle on an app icon, full circle on a chat avatar. */
  rounded?: string;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt="두드림"
      width={size}
      height={size}
      className={`flex-none ${className}`}
      style={{ borderRadius: rounded, objectFit: "cover" }}
    />
  );
}
