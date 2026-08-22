"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const FILM_SRC = "/intro.mp4";

/** Start fetching a screen early, so it is ready by the time it is looked at. */
const NEAR_MARGIN = "300px";

/**
 * The MVP, on film.
 *
 * A short vertical clip of the real device, sitting beside the claims it
 * supports. It costs nothing until it is nearly on screen: `src` is not set at
 * all until an observer says the reader is close, and it stops the moment they
 * scroll away — a decoder running behind the fold would be taking frames from
 * the WebGL scene for no one's benefit.
 *
 * The frame reads its aspect off the file rather than assuming one, so
 * replacing the clip with a different cut needs no change here.
 *
 * If the file is missing or will not decode, the whole card removes itself and
 * the section reads exactly as it did before. The film is an addition to the
 * argument, never a load-bearing part of it.
 */
export function MvpFilm({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const [near, setNear] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  // Load only once the reader is close to it.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: NEAR_MARGIN },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [near]);

  /*
   * Play while it is on screen, stop while it is not. A reader who asked for
   * reduced motion starts it themselves; nothing moves here unbidden.
   */
  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video || !near || reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(
            () => setPlaying(true),
            () => setPlaying(false),
          );
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [near, reduced]);

  const onLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setRatio(video.videoWidth / video.videoHeight);
    }
  }, []);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  // Unmuting is a gesture-gated action, and this button is the gesture.
  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  if (failed) return null;

  return (
    <figure className={`flex flex-col items-start ${className}`}>
      <div
        ref={frameRef}
        /*
          Sized against the card grid beside it, not against the column. A
          portrait clip is tall: at 17rem it finished some 200px below the last
          card and pulled the section out of balance. It is also well under the
          film's own 340px width, so nothing is ever upscaled soft.
        */
        className="relative w-full max-w-[14rem] overflow-hidden rounded-[1.25rem] border"
        style={{
          borderColor: "rgb(var(--stage-line) / 0.12)",
          backgroundColor: "rgb(var(--stage-ink) / 0.035)",
          // Hold the space before metadata lands so nothing jumps. The real
          // aspect replaces it as soon as the file says what it is.
          aspectRatio: ratio ? String(ratio) : "0.4722",
        }}
      >
        {near ? (
          <video
            ref={videoRef}
            className="block h-full w-full object-cover"
            src={FILM_SRC}
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            onLoadedMetadata={onLoadedMetadata}
            onError={() => setFailed(true)}
          />
        ) : null}
      </div>

      {/*
        Anything that plays on its own needs a way to stop it, and this loops
        past the point where that becomes a requirement rather than a courtesy.
        Text rather than glyphs, because the rest of the page speaks in type.
      */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="text-[0.75rem] text-soft transition-colors duration-300 hover:text-[rgb(var(--stage-ink))]"
        >
          {playing ? "일시정지" : "재생"}
        </button>
        <span aria-hidden="true" className="text-[0.75rem] text-faint">
          ·
        </span>
        <button
          type="button"
          onClick={toggleSound}
          className="text-[0.75rem] text-soft transition-colors duration-300 hover:text-[rgb(var(--stage-ink))]"
        >
          {muted ? "소리 켜기" : "소리 끄기"}
        </button>
      </div>

      <figcaption className="mt-2 text-[0.6875rem] leading-relaxed text-faint">
        MVP 시제품 영상
      </figcaption>
    </figure>
  );
}
