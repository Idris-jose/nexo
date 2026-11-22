"use client";
import { ExternalLink, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { STATE_KEY } from "@/lib/demo/constants";
import { cx } from "@/components/ui/cx";
import { splashKey } from "@/components/ui";
import { CTA, DEVICE, HIGHLIGHTS, PHONES, type View } from "./content";

const FRAME = 16; // Figma phone mockup padding
const GAP = 32;

function useIsLg() {
  const [lg, setLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setLg(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return lg;
}

export function PreviewStage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("view");
  const view: View = raw === "vendor" || raw === "both" ? raw : "customer";
  const isLg = useIsLg();
  const sideBySide = view === "both" && isLg;
  const device = DEVICE;
  const [scale, setScale] = useState(1);
  const stage = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLIFrameElement | null)[]>([]);

  const setView = (v: View) => router.replace(v === "customer" ? pathname : `${pathname}?view=${v}`, { scroll: false });

  // Port of the live preview's fit-to-viewport script.
  const fit = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    const avail = Math.max(480, window.innerHeight - 140);
    const cols = sideBySide ? 2 : 1;
    const maxW = (el.clientWidth - GAP * (cols - 1)) / cols;
    setScale(Math.min(1, avail / (device.h + FRAME * 2), maxW / (device.w + FRAME * 2)));
  }, [device, sideBySide]);

  useLayoutEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (stage.current) ro.observe(stage.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [fit]);

  const reset = () => {
    if (!confirm("Reset all demo data to the starting state?")) return;
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem("nexo.recentAreas");
    // The phones share this tab's sessionStorage; clearing the "seen" flags replays each splash on reload.
    Object.keys(sessionStorage).filter((k) => k.startsWith(splashKey("")) || k.startsWith("nexo.reviewSkipped.") || k.startsWith("nexo.bidAcceptedSeen.") || k.startsWith("nexo.paidSeen.")).forEach((k) => sessionStorage.removeItem(k));
    frames.current.forEach((f) => f?.contentWindow?.location.reload());
  };

  const outerW = device.w + FRAME * 2;
  const outerH = device.h + FRAME * 2;
  const content = view === "vendor" ? "vendor" : "customer";
  const cta = CTA[content];

  return (
    <>
      {/* View switcher (Figma "Segmented control") */}
      <section className="bg-white px-5 pb-8 pt-4 lg:px-16 lg:py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full max-w-[350px] items-center gap-1 rounded-full bg-seg p-1 lg:w-auto lg:max-w-none lg:p-1.5" role="tablist" aria-label="Account">
            {(["customer", "vendor", "both"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cx(
                  "flex-1 rounded-full px-7 py-3 text-base font-semibold leading-none transition lg:flex-none",
                  v === "both" && "hidden lg:block",
                  view === v ? "bg-navy text-white" : "text-body hover:text-navy",
                )}
              >
                {v === "customer" ? "Customer" : v === "vendor" ? "Vendor" : "Side by side"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={reset} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy hover:border-teal/40">
              <RotateCcw size={15} /> Reset demo
            </button>
          </div>
        </div>
      </section>

      {/* Phone showcase */}
      <section className="bg-surface px-5 py-8 lg:p-16">
        <div ref={stage} className="mx-auto flex max-w-[1312px] flex-wrap items-start justify-center gap-8">
          {(["customer", "vendor"] as const).map((key, i) => {
            const phone = PHONES[key];
            const visible = sideBySide || content === key;
            return (
              <figure key={key} className={cx("flex flex-col items-center", !visible && "hidden")} style={{ width: outerW * scale }}>
                <figcaption className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy">
                  {phone.caption}
                  <a href={phone.open} target="_blank" rel="noopener" className="text-teal" aria-label="Open full screen"><ExternalLink size={14} /></a>
                </figcaption>
                <div style={{ width: outerW * scale, height: outerH * scale }}>
                  <div className="origin-top-left" style={{ width: outerW, height: outerH, transform: `scale(${scale})` }}>
                    <div className="relative rounded-[56px] border-[16px] border-navy bg-navy shadow-glass">
                      <div className="pointer-events-none absolute left-1/2 top-1.5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-navy" />
                      <iframe
                        ref={(el) => {
                          frames.current[i] = el;
                        }}
                        src={phone.src}
                        title={phone.caption}
                        className="block rounded-[40px] bg-cream"
                        style={{ width: device.w, height: device.h }}
                      />
                    </div>
                  </div>
                </div>
              </figure>
            );
          })}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-body">
          Tip: on a real phone, just open this site. It’s fully responsive. Desktop visitors can also use the browser’s device toolbar (F12 → Ctrl+Shift+M).
        </p>
      </section>

      {/* Feature highlights */}
      <section className="bg-white px-5 py-12 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-[1312px] gap-5 lg:grid-cols-4 lg:gap-8">
          {HIGHLIGHTS[content].map(({ icon: I, title, body }) => (
            <div key={title} className="flex flex-col gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-mint text-teal"><I size={22} /></span>
              <p className="text-base font-semibold text-navy lg:text-xl">{title}</p>
              <p className="text-sm text-body lg:text-base">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion CTA */}
      <section className="flex flex-col items-center gap-6 bg-mint px-5 py-16 text-center lg:px-16 lg:py-24">
        <h2 className="font-display text-[32px] font-bold leading-tight text-navy lg:text-5xl">{cta.title}</h2>
        <p className="text-base text-body lg:text-lg">{cta.body}</p>
        <a href={cta.href} className={cx("rounded-xl px-7 py-4 text-base font-semibold leading-none text-white transition", cta.tone === "navy" ? "bg-navy hover:bg-nav" : "bg-teal hover:bg-primary-dark")}>
          {cta.label}
        </a>
      </section>
    </>
  );
}

export function PreviewStageFallback() {
  return (
    <>
      <section className="bg-white px-5 pb-8 pt-4 lg:px-16 lg:py-8">
        <div className="mx-auto h-[55px] w-[262px] rounded-full bg-seg" />
      </section>
      <section className="bg-surface px-5 py-8 lg:p-16">
        <div className="mx-auto h-[700px] w-[340px] rounded-[56px] bg-navy p-4"><div className="size-full rounded-[36px] bg-[#dce6ea]" /></div>
      </section>
    </>
  );
}
