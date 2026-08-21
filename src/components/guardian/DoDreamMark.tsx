/**
 * The DoDream mark, in one place.
 *
 * The brief pointed at `public/logo/` for the team logo. That directory does
 * not exist — there is no logo file anywhere in the repository or in its git
 * history — and inventing one was explicitly ruled out, so this falls back to
 * the wordmark the rest of the site already uses as its identity.
 *
 * Dropping a file into `public/logo/` and setting LOGO_SRC below is the entire
 * swap: the guardian app header, the KakaoTalk sender avatar and the lock
 * screen app icon all render through here.
 */

const LOGO_SRC: string | null = null;

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
  if (LOGO_SRC) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={LOGO_SRC}
        alt="두드림"
        width={size}
        height={size}
        className={className}
        style={{ borderRadius: rounded, objectFit: "cover" }}
      />
    );
  }

  /*
   * A monogram, not the wordmark. An app icon is 20px square and four Hangul
   * syllables at that size render as an unreadable smudge — the first syllable
   * alone stays legible, which is what a placeholder has to be.
   */
  return (
    <span
      className={`flex flex-none items-center justify-center font-display font-medium leading-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        backgroundColor: "#141e29",
        color: "#f4f3f0",
        fontSize: size * 0.52,
        letterSpacing: "-0.02em",
      }}
      aria-label="두드림"
      role="img"
    >
      두
    </span>
  );
}
