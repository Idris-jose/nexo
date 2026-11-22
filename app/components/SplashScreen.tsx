"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [stage, setStage] = useState<
    "initial" | "sliding-in" | "centered" | "sliding-out" | "done"
  >("initial");

  useEffect(() => {
    // Prevent scrolling while splash screen is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Step 1: Slide in from the right to the center
    const enterTimer = setTimeout(() => {
      setStage("sliding-in");
    }, 80);

    // Step 2: Settle at center
    const centerTimer = setTimeout(() => {
      setStage("centered");
    }, 1000);

    // Step 3: Slide out towards the left while fading background
    const exitTimer = setTimeout(() => {
      setStage("sliding-out");
    }, 1900);

    // Step 4: Fully remove from DOM and restore scrolling
    const finishTimer = setTimeout(() => {
      setStage("done");
      document.body.style.overflow = originalOverflow;
    }, 2600);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(centerTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (stage === "done") {
    return null;
  }

  // Calculate logo horizontal position
  let logoTransform = "translateX(100vw)";
  if (stage === "sliding-in" || stage === "centered") {
    logoTransform = "translateX(0)";
  } else if (stage === "sliding-out") {
    logoTransform = "translateX(-100vw)";
  }

  return (
    <div
      className="fixed inset-0 top-0 left-0 w-screen h-screen min-h-screen min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden select-none z-[999999]"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        minHeight: "100dvh",
        zIndex: 999999,
        backgroundColor: "#000000",
        opacity: stage === "sliding-out" ? 0 : 1,
        pointerEvents: stage === "sliding-out" ? "none" : "auto",
        transition: "opacity 700ms ease-in-out",
      }}
      aria-label="Loading NEXO®"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
        <div
          className="relative flex items-center justify-center px-6 will-change-transform"
          style={{
            transform: logoTransform,
            transitionProperty: "transform",
            transitionDuration: stage === "sliding-out" ? "750ms" : "900ms",
            transitionTimingFunction:
              stage === "sliding-out"
                ? "cubic-bezier(0.4, 0, 1, 1)"
                : "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <Image
            src="/Nexoimages/Nexo logo.png"
            alt="NEXO® Logo"
            width={340}
            height={130}
            priority
            className="w-auto h-16 sm:h-20 md:h-24 max-w-[85vw] object-contain "
          />
        </div>
      </div>
    </div>
  );
}
