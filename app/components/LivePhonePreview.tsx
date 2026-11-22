"use client";
import { useState } from "react";
import { DEVICE, PHONES } from "@/components/preview/content";

const SCALE = 0.72;
const FRAME = 12; // bezel thickness in px (unscaled)

/** The real demo app running inside a phone frame: tap around right on the landing page. */
export default function LivePhonePreview() {
  const [view, setView] = useState<"customer" | "vendor">("customer");
  const w = (DEVICE.w + FRAME * 2) * SCALE;
  const h = (DEVICE.h + FRAME * 2) * SCALE;
  return (
    <div className="flex flex-col items-center gap-4">
      <div role="tablist" aria-label="Preview account" className="flex rounded-full bg-white/10 p-1">
        {(["customer", "vendor"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${view === v ? "bg-white text-[#0B1F5C]" : "text-white/70 hover:text-white"}`}
          >
            {v === "customer" ? "Customer" : "Vendor"}
          </button>
        ))}
      </div>
      <div className="relative" style={{ width: w, height: h }}>
        <div className="absolute -inset-6 -z-10 rounded-[4rem] bg-[#0E8A7F]/20 blur-3xl" aria-hidden="true" />
        <div className="origin-top-left" style={{ width: DEVICE.w + FRAME * 2, height: DEVICE.h + FRAME * 2, transform: `scale(${SCALE})` }}>
          <div className="relative rounded-[52px] bg-[#132240] shadow-2xl" style={{ padding: FRAME, border: "2px solid #1e3560" }}>
            <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-[#132240]" />
            {(["customer", "vendor"] as const).map((v) => (
              <iframe
                key={v}
                src={PHONES[v].src}
                title={`Live NEXO® preview: ${PHONES[v].caption}`}
                loading="lazy"
                className={`rounded-[40px] bg-[#f3f5f8] ${view === v ? "block" : "hidden"}`}
                style={{ width: DEVICE.w, height: DEVICE.h }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-white/50">Live demo · tap around</p>
    </div>
  );
}
