"use client";

import { useInView } from "@/app/hooks/useInView";
import { CSSProperties, ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: ReactNode;
  delay?: number;        // ms stagger delay
  duration?: number;     // ms, default 600
  direction?: Direction;
  className?: string;
  style?: CSSProperties;
}

const translate: Record<Direction, string> = {
  up:    "translateY(28px)",
  down:  "translateY(-28px)",
  left:  "translateX(-28px)",
  right: "translateX(28px)",
  none:  "none",
};

export function FadeIn({
  children,
  delay = 0,
  duration = 600,
  direction = "up",
  className = "",
  style,
}: FadeInProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : translate[direction],
        transition: `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

