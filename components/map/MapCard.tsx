"use client";
import { CircleCheck, MapPin } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { userPhoto } from "@/lib/demo/photos";
import { area } from "@/lib/demo/geo";
import { cx } from "@/components/ui/cx";

export interface MapMarker {
  area: string;
  kind?: "destination" | "you" | "person";
  label?: string;
  initials?: string;
  hue?: number;
  /** Show this user's photo instead of initials. */
  photoId?: string;
  /** Marker diameter in px (default 36). */
  size?: number;
  seed?: number;
  /** Makes a person marker a button (e.g. the full "Providers nearby" map). */
  onSelect?: () => void;
  selected?: boolean;
}

const ROUTE = "#0e8a7f";

/** Equirectangular projection into the 400×240 viewBox, with golden-angle jitter for people. */
function project(areaKey: string, center: string, spanKm: number, seed = 0, spread = 1) {
  const a = area(areaKey);
  const c = area(center);
  const dx = (a.lng - c.lng) * 111 * Math.cos((c.lat * Math.PI) / 180);
  const dy = (a.lat - c.lat) * 111;
  const ang = seed * 2.39996;
  const r = seed ? (16 + ((seed * 13) % 22)) * spread : 0;
  const jx = Math.cos(ang) * r;
  const jy = Math.sin(ang) * r * 0.7;
  const x = Math.min(382, Math.max(18, 200 + (dx / spanKm) * 200 + jx));
  const y = Math.min(222, Math.max(18, 120 - (dy / spanKm) * 120 + jy));
  return { x, y };
}

export function MapCard({
  center, markers = [], spanKm = 14, route, progress, className, height = "h-56", caption, overlay, spread = 1,
}: {
  center: string; markers?: MapMarker[]; spanKm?: number; route?: { from: string; to: string }; progress?: number;
  className?: string; height?: string; caption?: string; overlay?: ReactNode;
  /** Scales the jitter between people in the same area (larger maps can afford more). */
  spread?: number;
}) {
  let path: string | null = null;
  let dot: { x: number; y: number } | null = null;
  if (route) {
    const A = project(route.from, center, spanKm, 3);
    const B = project(route.to, center, spanKm);
    const C = { x: (A.x + B.x) / 2 + 40, y: Math.min(A.y, B.y) - 30 };
    path = `M${A.x} ${A.y} Q${C.x} ${C.y} ${B.x} ${B.y}`;
    if (progress != null) {
      const t = Math.min(1, Math.max(0, progress));
      const u = 1 - t;
      dot = { x: u * u * A.x + 2 * u * t * C.x + t * t * B.x, y: u * u * A.y + 2 * u * t * C.y + t * t * B.y };
    }
  }
  return (
    <div className={cx("relative overflow-hidden rounded-2xl border border-line/80 bg-[#eef4ea]", height, className)}>
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <pattern id="nexo-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#dfe8da" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="240" fill="url(#nexo-grid)" />
        <path d="M-10 170 C 80 150, 120 200, 210 180 S 330 140, 420 160 L420 250 L-10 250Z" fill="#d7ecd3" />
        <ellipse cx="320" cy="60" rx="46" ry="26" fill="#cfe8d0" />
        <ellipse cx="70" cy="70" rx="34" ry="22" fill="#d4ebd3" />
        <path d="M250 -10 C 270 60, 230 110, 300 250" fill="none" stroke="#c9e0f0" strokeWidth="9" strokeLinecap="round" />
        <g fill="none" stroke="#fffdf8" strokeLinecap="round">
          <path d="M-10 120 C 100 110, 200 140, 420 100" strokeWidth="10" />
          <path d="M140 -10 C 150 80, 120 160, 160 250" strokeWidth="8" />
          <path d="M-10 40 L 420 70" strokeWidth="5" />
          <path d="M60 250 L 360 -10" strokeWidth="5" />
          <path d="M330 -10 C 340 100, 370 170, 360 250" strokeWidth="6" />
        </g>
        {path && (
          <>
            <path d={path} fill="none" stroke={ROUTE} strokeOpacity=".18" strokeWidth="10" strokeLinecap="round" />
            <path d={path} fill="none" stroke={ROUTE} strokeWidth="4" strokeLinecap="round" />
          </>
        )}
        {dot && (
          <>
            <circle cx={dot.x} cy={dot.y} r="16" fill={ROUTE} opacity=".15" />
            <circle cx={dot.x} cy={dot.y} r="8" fill={ROUTE} stroke="#fff" strokeWidth="3" />
          </>
        )}
      </svg>
      {markers.map((m, i) => {
        const p = project(m.area, center, spanKm, m.kind === "person" || !m.kind ? m.seed ?? i + 1 : 0, spread);
        const style = { left: `${(p.x / 400) * 100}%`, top: `${(p.y / 240) * 100}%` };
        if (m.kind === "destination")
          return (
            <span key={i} className="absolute -translate-x-1/2 -translate-y-full drop-shadow" style={style} title={m.label}>
              <MapPin size={34} className="fill-primary text-white" strokeWidth={1.6} />
            </span>
          );
        if (m.kind === "you")
          return <span key={i} className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-[6px] ring-primary/20" style={style} title="Your area" />;
        const photo = userPhoto(m.photoId);
        const px = m.size ?? 36;
        const cls = cx(
          "absolute flex -translate-x-1/2 overflow-hidden -translate-y-1/2 items-center justify-center rounded-full border-2 border-white font-display text-[11px] font-bold text-white shadow-card",
          m.onSelect && "cursor-pointer transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          m.selected && "z-10 scale-125 ring-4 ring-primary/30",
        );
        const look = { ...style, width: px, height: px, background: m.selected ? ROUTE : `hsl(${m.hue ?? 145} 50% 38%)` };
        const face = photo ? <Image src={photo} alt="" width={px} height={px} sizes={`${px * 2}px`} className="size-full object-cover" /> : m.initials;
        if (m.onSelect)
          return (
            <button key={i} type="button" onClick={m.onSelect} aria-label={m.label} aria-pressed={m.selected} className={cls} style={look}>
              {face}
            </button>
          );
        return (
          <span key={i} className={cls} style={look} title={m.label}>
            {face}
          </span>
        );
      })}
      {overlay}
      {caption && (
        <span className="glass absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-primary-dark shadow-soft">
          <CircleCheck size={13} /> {caption}
        </span>
      )}
    </div>
  );
}
