"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experience, useExperience } from "@/lib/experience-store";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const INTRO_SRC = "/intro.mp4";

/**
 * If the film has not produced a frame by now, it is not going to — a codec
 * the browser will not take, or a network that has gone quiet. Outright
 * failures (a 404, an undecodable file) surface as an `error` and leave well
 * before this.
 *
 * It sits just under the stage's own 4.5s readiness deadline, so the film can
 * never become the slowest thing on the page. A file whose moov atom is at the
 * end rather than the front will spend its whole download getting here, which
 * is the case for encoding the source with `-movflags +faststart`.
 */
const START_DEADLINE_MS = 4000;

/** The film has to be on screen a moment before offering a way out of it. */
const SKIP_AFTER_MS = 1400;

/**
 * How long a play control waits for a decision before the page continues on
 * its own. Only used when autoplay was refused — never when the reader has
 * asked for reduced motion, where the choice is theirs to make.
 */
const OFFER_GRACE_MS = 5000;

/** A last frame deserves to land before the room changes. */
const TAIL_MS = 220;

type Phase =
  /** Waiting on metadata, or on the first frame. */
  | "loading"
  /** The film is running. */
  | "playing"
  /** It will not start on its own; the reader is offered the control. */
  | "offer"
  /** Finished, skipped, or never going to happen. */
  | "done";

/**
 * The first thing anyone sees: the DoDream MVP, on film.
 *
 * This replaced a progress bar, and it keeps that bar's contract exactly — it
 * is `fixed`, so the document beneath never changes height and `StageDriver`'s
 * chapter anchors are measured against the real page from the first frame; it
 * holds the page still while it runs; and it releases through the same
 * `introComplete` flag the Hero already animates on.
 *
 * It also inherits the loader's real job. The film gives WebGL several seconds
 * to compile and present, so the cane is warm by the time the room changes —
 * which is why release waits on `sceneReady` as well as on the film. The scene
 * has its own 4.5s deadline, so this can never be the thing that stalls.
 *
 * Nothing here is a hard dependency. Every failure — a missing file, a refused
 * autoplay, a stall, a codec the browser rejects — lands in `done`, and `done`
 * is the same path the film takes when it simply ends.
 */
export function IntroOverlay() {
  const sceneReady = useExperience((state) => state.sceneReady);
  const introComplete = useExperience((state) => state.introComplete);
  const reduced = useReducedMotion();

  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** Metadata is resolved once, by whichever of the two paths gets there. */
  const handled = useRef(false);

  const [phase, setPhase] = useState<Phase>("loading");
  /** The film's own aspect, read off the file so nothing is ever stretched. */
  const [ratio, setRatio] = useState<number | null>(null);
  const [skippable, setSkippable] = useState(false);

  const finish = useCallback(() => setPhase("done"), []);

  /*
   * Autoplay needs `muted`, and it needs to be asked for in a way whose refusal
   * can be caught — so the attribute is left off and `play()` is called here.
   * A rejected promise is a policy decision, not an error, and it gets the
   * play control rather than a disappearing intro.
   */
  const start = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(
      () => setPhase("playing"),
      () => setPhase("offer"),
    );
  }, []);

  /*
   * Metadata is picked up by polling the element, not only by listening for
   * the event.
   *
   * A `<video>` starts fetching the moment React sets `src`, and with the file
   * warm it can reach HAVE_METADATA before the listener is attached — the
   * event has then already happened and never arrives, leaving the intro
   * waiting for something that is sitting right in front of it. Reading
   * `readyState` covers the case the listener misses, and `handled` keeps the
   * two from both firing.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || handled.current) return;

    const accept = () => {
      if (handled.current) return;
      handled.current = true;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setRatio(video.videoWidth / video.videoHeight);
      }
      /*
       * A reader who asked for less motion is not given moving pictures
       * unasked — they get the control and decide for themselves.
       *
       * The preference is read from the media query rather than from the hook,
       * which reports `false` on the hydration render by design and corrects
       * itself a beat later. That beat is long enough for this effect to have
       * already started the film, and once started there is no taking it back.
       */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPhase("offer");
        return;
      }
      start();
    };

    const reject = () => {
      if (handled.current) return;
      handled.current = true;
      finish();
    };

    if (video.error) {
      reject();
      return;
    }
    if (video.readyState >= 1 /* HAVE_METADATA */) {
      accept();
      return;
    }

    video.addEventListener("loadedmetadata", accept);
    video.addEventListener("error", reject);
    return () => {
      video.removeEventListener("loadedmetadata", accept);
      video.removeEventListener("error", reject);
    };
  }, [start, finish]);

  /* The film's own position, written straight to the DOM. A progress readout
     that re-rendered React on every frame would be competing with the decode. */
  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    const bar = barRef.current;
    if (!video || !bar || !video.duration || !Number.isFinite(video.duration)) return;
    bar.style.transform = `scaleX(${(video.currentTime / video.duration).toFixed(4)})`;
  }, []);

  // Nothing on screen yet, and time is up.
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = window.setTimeout(finish, START_DEADLINE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, finish]);

  // Offered, unanswered. Reduced motion opts out of the clock entirely.
  useEffect(() => {
    if (phase !== "offer" || reduced) return;
    const timer = window.setTimeout(finish, OFFER_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, reduced, finish]);

  // A way out, once there is something to leave.
  useEffect(() => {
    if (introComplete) return;
    const timer = window.setTimeout(() => setSkippable(true), SKIP_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [introComplete]);

  /*
   * While the film is up it is the only thing on screen, so it has to be the
   * only thing reachable. Without this, Tab walked the navbar and the CTAs
   * sitting invisible behind the overlay and never arrived at 건너뛰기 — a
   * keyboard reader had no way out at all.
   *
   * Same shape as the waitlist dialog's trap, including the `visibility` check:
   * the skip fades in, and an element that has not arrived yet must not be a
   * tab stop. Escape leaves from anywhere, so this contains focus without
   * trapping the reader.
   */
  useEffect(() => {
    if (introComplete) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        finish();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) =>
          element.offsetParent !== null &&
          getComputedStyle(element).visibility !== "hidden",
      );

      // Nothing to land on yet — hold still rather than fall through the page.
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [introComplete, finish]);

  // Announce the film as the thing that is on screen, without stealing a
  // control the reader cannot see yet.
  useEffect(() => {
    if (introComplete) return;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [introComplete]);

  /*
   * The room changes once the film is spent *and* the stage can draw. The
   * second half is what the old loader was for, and it still matters: lifting
   * on an unready canvas would hand the reader an empty Hero.
   */
  useEffect(() => {
    if (phase !== "done" || !sceneReady || introComplete) return;
    const timer = window.setTimeout(
      () => experience.setIntroComplete(true),
      reduced ? 0 : TAIL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase, sceneReady, introComplete, reduced]);

  // Hold the page still underneath, and start every visit at the top.
  useEffect(() => {
    if (introComplete) {
      document.body.removeAttribute("data-scroll-locked");
      return;
    }
    document.body.setAttribute("data-scroll-locked", "true");
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    return () => document.body.removeAttribute("data-scroll-locked");
  }, [introComplete]);

  /*
   * Let the decoder go the moment the intro is over. On a phone this is the
   * difference between handing the 3D scene a free GPU and making it share.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!introComplete || !video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
  }, [introComplete]);

  const showFilm = ratio !== null && phase !== "done";
  /** An offered film is already waiting on the reader — no need to also wait. */
  const canSkip = skippable || phase === "offer";

  return (
    <AnimatePresence>
      {introComplete ? null : (
        <motion.div
          key="intro"
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="두드림 제품 소개 영상"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-5 outline-none"
          style={{ backgroundColor: "var(--stage-bg)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="font-display text-[0.9375rem] font-medium tracking-[-0.02em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.15 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            두드림
          </motion.span>

          {/*
            The film sizes itself. `<video>` carries its own intrinsic
            dimensions, so `max-width`/`max-height` against `auto` sizing keeps
            the real aspect at every viewport without a hardcoded ratio — and
            without ever running wider than the screen it is on.

            It stays invisible until metadata lands, because before that the
            element reports the 300×150 default and would resize under the
            reader. Nothing outside this fixed layer moves either way.
          */}
          <motion.div
            className="relative mt-7 flex max-w-full items-center justify-center overflow-hidden rounded-[1.15rem] sm:mt-9 sm:rounded-[1.5rem]"
            style={{ boxShadow: "0 24px 60px -30px rgb(var(--stage-ink) / 0.3)" }}
            initial={false}
            animate={{ opacity: showFilm ? 1 : 0 }}
            transition={{ duration: reduced ? 0.15 : 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <video
              ref={videoRef}
              className="block h-auto max-h-[58svh] w-auto max-w-full sm:max-h-[64svh]"
              style={ratio ? { aspectRatio: String(ratio) } : undefined}
              src={INTRO_SRC}
              muted
              playsInline
              /* We intend to play it immediately; anything less is a stall. */
              preload="auto"
              disablePictureInPicture
              onTimeUpdate={onTimeUpdate}
              onEnded={finish}
            />
          </motion.div>

          {/* The film's position, in the hairline the loader used to fill. */}
          <div
            className="mt-6 h-px w-40 overflow-hidden transition-opacity duration-500 sm:w-56"
            style={{
              backgroundColor: "rgb(var(--stage-line) / 0.16)",
              opacity: phase === "playing" ? 1 : 0,
            }}
          >
            <div
              ref={barRef}
              className="h-full origin-left"
              style={{
                backgroundColor: "rgb(var(--stage-accent))",
                transform: "scaleX(0)",
              }}
            />
          </div>

          <div className="mt-5 flex min-h-[2.375rem] items-center gap-2">
            {phase === "offer" ? (
              <button type="button" onClick={start} className="btn btn-ghost btn-sm">
                영상 재생
              </button>
            ) : null}

            {/*
              Quiet, but not decorative: this is the way out of the film, and
              at `text-faint` it measured 2.8:1 against the warm ground — under
              AA for text this size. `text-soft` reads as the same aside at
              5.2:1. The padding is hit area, not weight.
            */}
            <button
              type="button"
              onClick={finish}
              className="flex min-h-[2.75rem] items-center rounded-full px-4 text-[0.75rem] text-soft transition-[opacity,visibility] duration-500 hover:text-[rgb(var(--stage-ink))]"
              style={{
                opacity: canSkip ? 1 : 0,
                // Not merely invisible — out of the tab order until it arrives.
                visibility: canSkip ? "visible" : "hidden",
                pointerEvents: canSkip ? "auto" : "none",
              }}
            >
              건너뛰기
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
