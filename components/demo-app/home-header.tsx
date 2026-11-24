"use client";
import { Bell, CircleCheck, Clock, MapPin, Search, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { setArea } from "@/lib/demo/actions";
import { AREA_KEYS, area } from "@/lib/demo/geo";
import { useStore } from "@/lib/demo/store";
import type { User } from "@/lib/demo/types";
import { Avatar, IconButton, Modal, cx, toast } from "@/components/ui";

/** NEXO® logo (navy, transparent background) at the top left of the main app pages. */
export function BrandMark() {
  return <Image src="/brand/nexo-logo-navy.png" alt="NEXO® marketplace" width={1493} height={470} priority className="mb-4 h-7 w-auto" />;
}

/** Home header shared by both apps: photo, greeting, location selector and notifications. */
export function HomeHeader({ user }: { user: User }) {
  const s = useStore();
  const [picking, setPicking] = useState(false);
  const unread = s.notices.filter((n) => n.userId === user.id && !n.read).length;
  const hour = new Date().getHours();
  const here = area(user.area);
  return (
    <>
      <BrandMark />
      <div className="mb-5 flex items-center gap-3">
        <a href="#/profile" aria-label="Your profile" className="shrink-0 rounded-full">
          <Avatar name={user.name} id={user.id} size={48} />
        </a>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[18px] font-bold leading-tight text-ink">
            {hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, {user.name.split(" ")[0]}
          </h1>
          <button type="button" onClick={() => setPicking(true)} aria-label={`Location: ${here.suburb}, ${here.city}. Change location`} className="mt-0.5 inline-flex max-w-full items-center gap-1 text-[14px] font-semibold text-muted hover:text-ink">
            <MapPin size={15} className="shrink-0 text-primary" />
            <span className="truncate">{here.suburb}, {here.city}</span>
            <ChevronDown size={15} className="shrink-0" />
          </button>
        </div>
        <IconButton icon={Bell} label={unread ? `Notifications, ${unread} unread` : "Notifications"} href="#/notifications" badge={unread} />
      </div>
      {picking && <LocationSheet onClose={() => setPicking(false)} user={user} />}
    </>
  );
}

const RECENT_AREAS_KEY = "nexo.recentAreas";

/** Recently picked areas first, then the rest of the demo areas: every demo location shows as a recent search. */
function recentAreas(current: string): string[] {
  let saved: string[] = [];
  try {
    saved = JSON.parse(localStorage.getItem(RECENT_AREAS_KEY) ?? "[]");
  } catch {}
  const order = [current, ...saved.filter((k) => AREA_KEYS.includes(k)), ...AREA_KEYS];
  return [...new Set(order)];
}

function LocationSheet({ onClose, user }: { onClose: () => void; user: User }) {
  const [q, setQ] = useState("");
  const [recent] = useState(() => recentAreas(user.area));
  const term = q.trim().toLowerCase();
  const matches = term
    ? AREA_KEYS.filter((k) => {
        const a = area(k);
        return [a.suburb, a.city, a.province, `${a.suburb}, ${a.city}`].some((x) => x.toLowerCase().includes(term));
      })
    : recent;
  const pick = (k: string) => {
    setArea(user.id, k);
    localStorage.setItem(RECENT_AREAS_KEY, JSON.stringify([k, ...recent.filter((x) => x !== k)]));
    onClose();
    toast(`Location set to ${area(k).suburb}`);
  };
  return (
    <Modal open onClose={onClose} title="Your location">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (term && matches.length) pick(matches[0]);
        }}
      >
        <label className="relative block">
          <span className="sr-only">Search for a location</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search suburb or city"
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-10 text-[15px] text-ink outline-none placeholder:text-muted focus:border-primary"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"><X size={18} /></button>
          )}
        </label>
      </form>
      <p className="mb-2 mt-5 text-[13px] font-semibold text-muted">{term ? "Results" : "Recent searches"}</p>
      {matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white px-4 py-5 text-center">
          <p className="text-[15px] font-semibold text-ink">“{q.trim()}” isn’t available in the demo</p>
          <p className="mt-1 text-[13px] text-muted">Try one of: {AREA_KEYS.map((k) => area(k).suburb).join(", ")}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((k) => {
            const a = area(k);
            const on = k === user.area;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => pick(k)}
                className={cx("flex w-full items-center gap-3 rounded-xl border bg-white px-3.5 py-3 text-left transition", on ? "border-primary" : "border-line hover:border-primary/40")}
              >
                {term ? <MapPin size={18} className={on ? "text-primary" : "text-muted"} /> : <Clock size={18} className={on ? "text-primary" : "text-muted"} />}
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink">{a.suburb}</span>
                  <span className="block text-[13px] text-muted">{a.city}, {a.province}</span>
                </span>
                {on && <CircleCheck size={18} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">We show vendors near this area. Your exact address is only shared with the vendor you book.</p>
    </Modal>
  );
}
