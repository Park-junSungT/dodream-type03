"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DoDreamMark } from "./DoDreamMark";
import { StatusBar } from "./PhoneShell";
import { GUARDIAN_COPY } from "@/lib/guardian-route";

/**
 * The alert as it lands on a locked phone.
 *
 * Wallpaper, big clock, and a frosted notification card — the shape every
 * modern phone uses. Built from HTML and CSS: the wallpaper is a gradient, the
 * card is a translucent panel with a blur behind it, and the app icon is the
 * DoDream mark.
 */
export function LockScreen({
  clock,
  fallen,
  reduced,
}: {
  clock: string;
  fallen: boolean;
  reduced: boolean;
}) {
  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      style={{
        background:
          "linear-gradient(168deg,#2b3240 0%,#1d222c 38%,#161a22 68%,#20252f 100%)",
      }}
    >
      <StatusBar clock={clock} dark />

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex-none pt-7 text-center">
          <p
            className="text-[0.75rem]"
            style={{ color: "rgb(255 255 255 / 0.62)" }}
          >
            8월 21일 금요일
          </p>
          <p
            className="mt-1 font-display text-[3.4rem] font-medium leading-none tracking-[-0.03em] tabular-nums"
            style={{ color: "rgb(255 255 255 / 0.96)" }}
          >
            {clock}
          </p>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {fallen ? (
              <motion.div
                key="notif"
                initial={{ opacity: 0, y: reduced ? 0 : -14, scale: reduced ? 1 : 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
                transition={{ duration: reduced ? 0.12 : 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex-none rounded-[1.15rem] p-3"
                style={{
                  backgroundColor: "rgb(255 255 255 / 0.14)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgb(255 255 255 / 0.12)",
                }}
              >
                <div className="flex items-center gap-2">
                  <DoDreamMark size={20} rounded="0.4rem" />
                  <span
                    className="min-w-0 flex-1 truncate text-[0.6875rem]"
                    style={{ color: "rgb(255 255 255 / 0.72)" }}
                  >
                    {GUARDIAN_COPY.push.sender}
                  </span>
                  <span
                    className="flex-none text-[0.6875rem]"
                    style={{ color: "rgb(255 255 255 / 0.6)" }}
                  >
                    {GUARDIAN_COPY.push.at}
                  </span>
                </div>
                <p
                  className="mt-2 text-[0.875rem] font-medium leading-snug"
                  style={{ color: "rgb(255 255 255 / 0.97)" }}
                >
                  {GUARDIAN_COPY.push.title}
                </p>
                <p
                  className="mt-1 text-[0.8125rem] leading-relaxed"
                  style={{ color: "rgb(255 255 255 / 0.78)" }}
                >
                  {GUARDIAN_COPY.push.body}
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="quiet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 flex-none text-center text-[0.75rem]"
                style={{ color: "rgb(255 255 255 / 0.42)" }}
              >
                새로운 알림이 없습니다
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <span
          aria-hidden="true"
          className="mx-auto mt-4 block h-[4px] w-[7.5rem] flex-none rounded-full"
          style={{ backgroundColor: "rgb(255 255 255 / 0.38)" }}
        />
      </div>
    </div>
  );
}
