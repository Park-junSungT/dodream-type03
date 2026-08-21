"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DoDreamMark } from "./DoDreamMark";
import { StatusBar } from "./PhoneShell";
import { GUARDIAN, GUARDIAN_PLACE } from "@/lib/guardian-route";

/**
 * The message the guardian receives.
 *
 * A Korean messaging layout — conversation header, dated divider, avatar
 * beside an incoming bubble, timestamp on the outside — written from scratch
 * in HTML and CSS. None of KakaoTalk's own artwork, icons or exact colours are
 * reproduced; this borrows the shape of a conversation, which is what makes it
 * legible at a glance, and nothing else.
 */
export function KakaoChatScreen({
  clock,
  fallen,
  reduced,
}: {
  clock: string;
  fallen: boolean;
  reduced: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ backgroundColor: "#c3d0dc" }}>
      <div style={{ backgroundColor: "#c3d0dc" }}>
        <StatusBar clock={clock} />
      </div>

      {/* Conversation header. */}
      <div
        className="flex flex-none items-center gap-3 px-4 pb-3 pt-2"
        style={{ backgroundColor: "#c3d0dc" }}
      >
        <span
          aria-hidden="true"
          className="block h-3.5 w-3.5 flex-none rotate-45 border-b-2 border-l-2"
          style={{ borderColor: "rgb(20 30 41 / 0.7)" }}
        />
        <p className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium" style={{ color: "#141e29" }}>
          두드림
        </p>
        <span aria-hidden="true" className="flex flex-none flex-col gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="block h-[3px] w-[15px] rounded-full" style={{ backgroundColor: "rgb(20 30 41 / 0.55)" }} />
          ))}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3.5 pb-4 pt-1">
        <p className="mx-auto flex-none rounded-full px-3 py-1 text-[0.625rem]"
           style={{ backgroundColor: "rgb(20 30 41 / 0.12)", color: "rgb(20 30 41 / 0.65)" }}>
          오늘
        </p>

        <AnimatePresence initial={false}>
          {fallen ? (
            <motion.div
              key="alert"
              className="flex flex-none items-start gap-2"
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.12 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <DoDreamMark size={34} rounded="0.85rem" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.6875rem]" style={{ color: "rgb(20 30 41 / 0.7)" }}>
                  두드림
                </p>
                <div className="mt-1 flex items-end gap-1.5">
                  <div
                    className="min-w-0 max-w-[13.5rem] rounded-[0.9rem] rounded-tl-[0.2rem] px-3 py-2.5"
                    style={{ backgroundColor: "#ffffff", color: "#141e29" }}
                  >
                    <p className="text-[0.8125rem] font-medium leading-relaxed">
                      낙상이 감지되었습니다.
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed">
                      {GUARDIAN.walker}님의 현재 위치를 확인해주세요.
                    </p>
                    <dl
                      className="mt-2.5 flex flex-col gap-1 border-t pt-2.5 text-[0.75rem]"
                      style={{ borderColor: "rgb(20 30 41 / 0.1)" }}
                    >
                      <div className="flex gap-2">
                        <dt style={{ color: "rgb(20 30 41 / 0.5)" }}>발생 위치</dt>
                        <dd>{GUARDIAN_PLACE.name}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt style={{ color: "rgb(20 30 41 / 0.5)" }}>발생 시간</dt>
                        <dd className="tabular-nums">{clock}</dd>
                      </div>
                    </dl>
                  </div>
                  <span className="flex-none pb-0.5 text-[0.625rem] tabular-nums" style={{ color: "rgb(20 30 41 / 0.55)" }}>
                    {clock}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              className="mx-auto mt-6 max-w-[12rem] flex-none text-center text-[0.75rem] leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: "rgb(20 30 41 / 0.5)" }}
            >
              안전 상황이 감지되면 이곳으로 알림이 전달됩니다.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Composer, present but inert — this is a notification channel. */}
      <div
        className="flex flex-none items-center gap-2 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2"
        style={{ backgroundColor: "#ffffff" }}
      >
        <span aria-hidden="true" className="block h-5 w-5 flex-none rounded-full border-2" style={{ borderColor: "rgb(20 30 41 / 0.28)" }} />
        <span className="min-w-0 flex-1 truncate text-[0.75rem]" style={{ color: "rgb(20 30 41 / 0.35)" }}>
          메시지 입력
        </span>
      </div>
    </div>
  );
}
