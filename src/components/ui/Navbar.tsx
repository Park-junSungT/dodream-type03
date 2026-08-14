"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHAPTERS, NAV_LINKS } from "@/lib/story";
import { experience, useExperience } from "@/lib/experience-store";
import { scrollToChapter } from "@/lib/navigate";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A quiet, sticky bar. It stays out of the way of the product: transparent
 * over the hero, then a hairline and a faint wash once the story starts.
 */
export function Navbar() {
  const chapter = useExperience((state) => state.chapter);
  const menuOpen = useExperience((state) => state.menuOpen);
  const joined = useExperience((state) => state.waitlistJoined);
  const [condensed, setCondensed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet on Escape, and whenever the viewport grows past mobile.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") experience.setMenuOpen(false);
    };
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (media.matches) experience.setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onChange);
    };
  }, [menuOpen]);

  const go = useCallback((id: string) => {
    experience.setMenuOpen(false);
    scrollToChapter(id);
  }, []);

  const openWaitlist = useCallback(() => {
    experience.setMenuOpen(false);
    experience.setWaitlistOpen(true);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40"
      data-condensed={condensed ? "true" : undefined}
    >
      <div
        className="pointer-events-none absolute inset-0 border-b transition-[opacity,background-color] duration-500"
        style={{
          opacity: condensed ? 1 : 0,
          backgroundColor: "rgb(var(--stage-ink) / 0.03)",
          borderColor: "rgb(var(--stage-line) / 0.1)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          // Fade the blur out at its lower edge, so the bar never draws a
          // visible seam across the product behind it.
          maskImage: "linear-gradient(to bottom, #000 58%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 58%, transparent 100%)",
        }}
      />

      <nav
        aria-label="주요 메뉴"
        className="shell relative flex h-16 items-center justify-between sm:h-[4.5rem]"
      >
        <a
          href="#hero"
          onClick={(event) => {
            event.preventDefault();
            go("hero");
          }}
          className="font-display text-[1.0625rem] font-medium tracking-[-0.02em]"
        >
          DoDream
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => {
                event.preventDefault();
                go(link.id);
              }}
              aria-current={
                chapter === chapterIndexOf(link.id) ? "true" : undefined
              }
              className="rounded-full px-3.5 py-2 text-[0.8125rem] font-medium text-soft transition-colors duration-300 hover:text-[rgb(var(--stage-ink))] aria-[current=true]:text-[rgb(var(--stage-ink))]"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={openWaitlist}
            className="btn btn-primary btn-sm ml-3"
          >
            {joined ? "등록 완료" : "관심 등록"}
          </button>
        </div>

        <button
          type="button"
          className="relative -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
          aria-expanded={menuOpen}
          aria-controls="dd-mobile-menu"
          onClick={() => experience.setMenuOpen(!menuOpen)}
        >
          <span className="sr-only">{menuOpen ? "메뉴 닫기" : "메뉴 열기"}</span>
          <span aria-hidden="true" className="relative block h-3 w-5">
            <span
              className="absolute left-0 block h-px w-5 bg-[rgb(var(--stage-ink))] transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: menuOpen
                  ? "translateY(6px) rotate(45deg)"
                  : "translateY(0)",
              }}
            />
            <span
              className="absolute left-0 top-3 block h-px w-5 bg-[rgb(var(--stage-ink))] transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: menuOpen
                  ? "translateY(-6px) rotate(-45deg)"
                  : "translateY(0)",
              }}
            />
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="dd-mobile-menu"
            key="menu"
            initial={{ opacity: 0, y: reduced ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: reduced ? 0.15 : 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden"
          >
            <div
              className="shell border-b py-6"
              style={{
                backgroundColor: "var(--stage-bg)",
                borderColor: "rgb(var(--stage-line) / 0.1)",
              }}
            >
              <ul className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        go(link.id);
                      }}
                      className="block py-3 font-display text-2xl tracking-[-0.03em]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={openWaitlist}
                className="btn btn-primary mt-4 w-full"
              >
                {joined ? "등록 완료" : "관심 등록하기"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function chapterIndexOf(id: string) {
  return CHAPTERS.findIndex((chapter) => chapter.id === id);
}
