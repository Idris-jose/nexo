"use client";
import { useEffect } from "react";

/**
 * Inside the preview-page phone iframes, a wheel/touch scroll that reaches the top or bottom of the
 * phone screen would "chain" to the preview page and scroll it. Stop that: when nothing under the
 * pointer can scroll further in that direction, cancel the gesture. Outside an iframe this does nothing.
 */
export function FrameScrollLock() {
  useEffect(() => {
    if (window.self === window.top) return;
    document.documentElement.style.overscrollBehavior = "contain";

    const canScroll = (from: EventTarget | null, dy: number) => {
      const fits = (el: Element) => (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1);
      for (let el = from instanceof Element ? from : null; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight && fits(el)) return true;
      }
      return fits(document.scrollingElement ?? document.documentElement);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !canScroll(e.target, e.deltaY)) e.preventDefault();
    };
    let startX = 0;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = startX - e.touches[0].clientX;
      const dy = startY - e.touches[0].clientY;
      if (e.cancelable && Math.abs(dy) > Math.abs(dx) && !canScroll(e.target, dy)) e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);
  return null;
}
