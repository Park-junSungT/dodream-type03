"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** How much of the block must be on screen before it settles in. */
  amount?: number;
  as?: "div" | "li" | "section";
};

/**
 * A single, restrained entrance: copy rises a few pixels and fades once.
 * Under `prefers-reduced-motion` it becomes a short opacity change so the
 * hierarchy still reads without anything travelling across the screen.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.4,
  as = "div",
}: Props) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: reduced ? 0.2 : 0.85,
        delay: reduced ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Component>
  );
}
