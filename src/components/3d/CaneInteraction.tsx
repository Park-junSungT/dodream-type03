"use client";

import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { experience, motion, useExperience } from "@/lib/experience-store";

/**
 * The gesture surface for the product.
 *
 * It sits *underneath* the WebGL canvas (which is pointer-transparent) and
 * underneath the story copy, so it only ever receives input that nothing else
 * wanted. That ordering is what guarantees the 3D never steals a scroll, a
 * link or a form field.
 *
 * Desktop and touch run the same model with different verbs:
 *   • move the mouse / drag a finger sideways → turn the product
 *   • drag the mouse vertically              → raise or lower the camera
 *   • pinch (while inspecting)               → move closer or further away
 *   • tap empty space                        → dismiss the open feature
 *
 * `touch-action` keeps vertical scrolling with the browser at all times. Only
 * while the exploration chapter is on screen is native pinch-zoom taken over
 * for product inspection; everywhere else the page zooms normally.
 */
export function CaneInteraction({ reducedMotion }: { reducedMotion: boolean }) {
  const exploring = useExperience((state) => state.exploring);
  const hasFeature = useExperience((state) => state.activeFeature !== null);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef({
    active: false,
    id: -1,
    touch: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
    lastTime: 0,
    moved: false,
  });
  const pinch = useRef({ active: false, distance: 0, zoom: 1 });

  const updateHoverParallax = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse" || reducedMotion) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (0.5 - event.clientY / window.innerHeight) * 2;
      motion.pointerX = Math.max(-1, Math.min(1, x));
      motion.pointerY = Math.max(-1, Math.min(1, y));
      motion.pointerActive = true;
    },
    [reducedMotion],
  );

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current.active = true;
      pinch.current.distance = Math.hypot(a.x - b.x, a.y - b.y);
      pinch.current.zoom = motion.zoom;
      drag.current.active = false;
      return;
    }

    if (pointers.current.size > 1) return;
    // A mouse only drags with the primary button held.
    if (event.pointerType === "mouse" && event.buttons !== 1) return;

    drag.current = {
      active: true,
      id: event.pointerId,
      touch: event.pointerType !== "mouse",
      lastX: event.clientX,
      lastY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      lastTime: event.timeStamp,
      moved: false,
    };
    motion.dragging = true;
    motion.dragVelocity = 0;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const tracked = pointers.current.get(event.pointerId);
      if (tracked) {
        tracked.x = event.clientX;
        tracked.y = event.clientY;
      }

      if (pinch.current.active && pointers.current.size === 2) {
        const [a, b] = Array.from(pointers.current.values());
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch.current.distance > 0) {
          const ratio = distance / pinch.current.distance;
          motion.zoom = Math.max(0.7, Math.min(1.7, pinch.current.zoom * ratio));
          experience.markInteracted();
        }
        return;
      }

      if (!drag.current.active || drag.current.id !== event.pointerId) {
        updateHoverParallax(event);
        return;
      }

      const dx = event.clientX - drag.current.lastX;
      const dy = event.clientY - drag.current.lastY;
      const dt = Math.max(8, event.timeStamp - drag.current.lastTime) / 1000;
      drag.current.lastX = event.clientX;
      drag.current.lastY = event.clientY;
      drag.current.lastTime = event.timeStamp;

      if (
        !drag.current.moved &&
        Math.hypot(
          event.clientX - drag.current.startX,
          event.clientY - drag.current.startY,
        ) > 4
      ) {
        drag.current.moved = true;
        experience.markInteracted();
      }

      const yawDelta = dx * 0.0062;
      motion.dragYaw += yawDelta;
      motion.dragVelocity = yawDelta / dt;

      // Vertical belongs to the page on touch; on a mouse it tilts the camera.
      if (!drag.current.touch) {
        motion.dragPitch = Math.max(
          -0.45,
          Math.min(0.45, motion.dragPitch + dy * 0.0022),
        );
      }
    },
    [updateHoverParallax],
  );

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);

    if (pointers.current.size < 2) {
      pinch.current.active = false;
    }

    if (drag.current.active && drag.current.id === event.pointerId) {
      const wasTap = !drag.current.moved;
      drag.current.active = false;
      motion.dragging = false;
      event.currentTarget.releasePointerCapture?.(event.pointerId);

      // A tap on empty space returns to the whole product.
      if (wasTap && event.type === "pointerup") {
        experience.setActiveFeature(null);
      }
    }
  }, []);

  const onPointerLeave = useCallback(() => {
    motion.pointerActive = false;
    motion.pointerX = 0;
    motion.pointerY = 0;
  }, []);

  return (
    <div
      className="fixed inset-0 z-0"
      style={{
        touchAction: exploring ? "pan-y" : "pan-y pinch-zoom",
        cursor: exploring ? (hasFeature ? "zoom-out" : "grab") : "default",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={onPointerLeave}
      aria-hidden="true"
    />
  );
}
