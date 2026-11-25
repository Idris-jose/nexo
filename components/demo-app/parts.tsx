"use client";
import { Check, ChevronRight, ExternalLink, FlaskConical, Lock, Megaphone, ShieldCheck, User as UserIcon, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { demoNextStep, trackAd } from "@/lib/demo/actions";
import { STAGES } from "@/lib/demo/constants";
import { demoLabel } from "@/lib/demo/demo-step";
import { hoursLabel, statusPill, timeAgo } from "@/lib/demo/format";
import { formatRand } from "@/lib/demo/money";
import { sessionId } from "@/lib/demo/session";
import { useStore } from "@/lib/demo/store";
import type { AdSlot, Gig, Viewer } from "@/lib/demo/types";
import { Badge, Button, Card, Modal, Money, cx, toast } from "@/components/ui";

/* ---------- Progress ---------- */
export function GigProgress({ gig, compact }: { gig: Gig; compact?: boolean }) {
  const done = gig.status === "completed";
  const s = done ? 4 : STAGES.findIndex((x) => x.key === gig.stage);
  const doneUpTo = gig.status === "start_verification" ? -1 : gig.status === "completion_verification" ? 2 : s - 1;
  const current = gig.status === "start_verification" ? 0 : gig.status === "completion_verification" ? 3 : s;
  if (compact)
    return (
      <ol className="grid grid-cols-4 gap-2" aria-label="Gig progress">
        {STAGES.map((st, i) => {
          const isDone = i <= doneUpTo || done;
          const isCur = i === current && !done;
          return (
            <li key={st.key} className="flex flex-col items-center gap-1.5 text-center">
              <span className={cx("flex size-9 items-center justify-center rounded-full border-2", isDone ? "border-primary bg-primary text-white" : isCur ? "border-primary bg-primary-soft text-primary" : "border-line bg-white text-muted")}>
                {isDone ? <Check size={16} strokeWidth={3} /> : <span className={cx("size-2 rounded-full", isCur ? "bg-primary" : "bg-line")} />}
              </span>
              <span className={cx("text-[11px] font-semibold leading-tight", isDone || isCur ? "text-ink" : "text-muted")}>{st.label.replace(" at Location", "")}</span>
            </li>
          );
        })}
      </ol>
    );
  return (
    <ol aria-label="Gig progress">
      {STAGES.map((st, i) => {
        const isDone = i <= doneUpTo || done;
        const isCur = i === current && !done;
        return (
          <li key={st.key} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span className={cx("flex size-7 shrink-0 items-center justify-center rounded-full border-2", isDone ? "border-primary bg-primary text-white" : isCur ? "border-primary bg-primary-soft" : "border-line bg-white")}>
                {isDone ? <Check size={14} strokeWidth={3} /> : <span className={cx("size-2 rounded-full", isCur ? "bg-primary" : "bg-line")} />}
              </span>
              {i < STAGES.length - 1 && <span className={cx("my-1 min-h-5 w-0.5 flex-1", isDone ? "bg-primary" : "bg-line")} />}
            </div>
            <div className="pb-4">
              <p className="text-[15px] font-semibold leading-7">{st.label}</p>
              <p className={cx("text-xs font-semibold", isDone || isCur ? "text-primary" : "text-muted")}>{isDone ? "Completed" : isCur ? "In progress" : "Pending"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Status timeline ---------- */
interface TimelineEvent { label: string; at: number }

function timelineEvents(gig: Gig, bidsAt: number[], viewer: Viewer, vendorShort?: string): TimelineEvent[] {
  const who = viewer === "requestor" ? vendorShort ?? "Vendor" : "You";
  const ev: (TimelineEvent | null)[] = [
    { label: gig.mode === "bid" ? "Gig posted" : "Request sent", at: gig.createdAt },
    bidsAt.length ? { label: "First bid received", at: Math.min(...bidsAt) } : null,
    gig.paidAt ? { label: "Payment confirmed", at: gig.paidAt } : null,
    gig.travelStartedAt ? { label: viewer === "vendor" ? "You’re on the way" : `${who} on the way`, at: gig.travelStartedAt } : null,
    gig.arrivedAt ? { label: `${who} arrived`, at: gig.arrivedAt } : null,
    gig.startedAt ? { label: "Gig started", at: gig.startedAt } : null,
    gig.completeMarkedAt ? { label: "Marked complete", at: gig.completeMarkedAt } : null,
    gig.completedAt ? { label: "Completion verified", at: gig.completedAt } : null,
    gig.review ? { label: "Review submitted", at: gig.review.at } : null,
    gig.cancelledAt ? { label: "Gig cancelled", at: gig.cancelledAt } : null,
  ];
  return ev.filter((e): e is TimelineEvent => !!e).sort((a, b) => b.at - a.at);
}

const clock = (at: number) => new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function TimelineList({ events }: { events: TimelineEvent[] }) {
  return (
    <ol aria-label="Status timeline">
      {events.map((e, i) => (
        <li key={e.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={cx("flex size-6 shrink-0 items-center justify-center rounded-full text-white", e.label === "Gig cancelled" ? "bg-danger" : "bg-primary")}>
              <Check size={13} strokeWidth={3} />
            </span>
            {i < events.length - 1 && <span className="my-1 min-h-4 w-0.5 flex-1 bg-primary/30" />}
          </div>
          <div className={cx("min-w-0", i < events.length - 1 && "pb-3")}>
            <p className="text-[14.5px] font-semibold leading-6 text-ink">{e.label}</p>
            <p className="text-[12.5px] text-muted">{clock(e.at)} · {timeAgo(e.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Vertical status timeline, newest first: the latest two events; the full history opens in a sheet. */
export function GigTimeline({ gig, viewer }: { gig: Gig; viewer: Viewer }) {
  const s = useStore();
  const [full, setFull] = useState(false);
  const bidsAt = s.bids.filter((b) => b.gigId === gig.id).map((b) => b.createdAt);
  const vendor = s.users.find((u) => u.id === gig.vendorId);
  const events = timelineEvents(gig, bidsAt, viewer, vendor?.short);
  return (
    <div>
      <p className="mb-3 text-[16px] font-bold text-ink">Status timeline</p>
      <TimelineList events={events.slice(0, 2)} />
      {events.length > 2 && (
        <button type="button" onClick={() => setFull(true)} className="mt-3 text-[14px] font-semibold text-primary hover:underline">
          View full timeline ({events.length})
        </button>
      )}
      <Modal open={full} onClose={() => setFull(false)} title="Status timeline">
        <p className="-mt-3 mb-4 text-[13.5px] text-muted">{gig.title} · {gig.ref}</p>
        <TimelineList events={events} />
      </Modal>
    </div>
  );
}

/** Figma summary row ("Accepted bid ... R85,000"). */
export function Row({ k, v, strong, muted, sub }: { k: ReactNode; v: ReactNode; strong?: boolean; muted?: boolean; sub?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className={cx("text-sm", muted ? "text-muted" : "text-ink/80", strong && "font-semibold text-ink")}>{k}</span>
      <span className="text-right">
        <span className={cx("block tabular-nums", strong ? "font-display text-base font-bold text-ink" : "text-sm font-semibold text-ink")}>{v}</span>
        {sub && <span className="block text-xs text-muted">{sub}</span>}
      </span>
    </div>
  );
}

export function PaymentBreakdown({ gig, viewer }: { gig: Gig; viewer: Viewer }) {
  const st = gig.settlement;
  if (!st) return null;
  if (viewer === "vendor")
    return (
      <div>
        <Row k="Service amount" v={formatRand(st.serviceCents)} />
        {st.billableMinutes != null && <Row k={`Billed time (${hoursLabel(st.billableMinutes)} h)`} v={formatRand(st.serviceCents)} muted />}
        <Row k="NEXO® commission (12%)" v={`-${formatRand(st.commissionCents)}`} muted />
        <div className="my-1.5 border-t border-line" />
        <Row k="You received" v={formatRand(st.payoutCents)} strong />
      </div>
    );
  return (
    <div>
      <Row k="Service amount" v={formatRand(st.serviceCents)} />
      {st.firstHourCents != null && (
        <>
          <Row k="First hour (paid at booking)" v={formatRand(st.firstHourCents)} muted />
          <Row k={`Remaining ${hoursLabel(st.billableMinutes! - 60)} h`} v={formatRand(st.remainingCents ?? 0)} muted />
        </>
      )}
      <Row k="Service fee (non-refundable)" v={formatRand(st.feeCents)} muted />
      <div className="my-1.5 border-t border-line" />
      <Row k="Total paid" v={formatRand(st.totalCents)} strong />
    </div>
  );
}

export function ProtectionNote({ children = "Payment protected until service completion." }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-primary-soft px-3 py-2.5 text-[13px] font-medium text-primary-dark">
      <ShieldCheck size={16} className="mt-px shrink-0" /> {children}
    </p>
  );
}

/** Figma privacy note (lock + small grey text). */
export function LockNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-muted">
      <Lock size={13} className="mt-0.5 shrink-0" /> {children}
    </p>
  );
}

export function PrivateBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
      <Lock size={11} /> Private
    </span>
  );
}

/** Figma My Gigs card: title, person line, status badge, amount, chevron. */
export function GigRow({ gig, viewer, href, amountCents, hourly, sub }: { gig: Gig; viewer: Viewer; href: string; amountCents: number; hourly?: boolean; sub: ReactNode }) {
  const pill = statusPill(gig, viewer);
  return (
    <Card href={href} className="p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold text-ink">{gig.title}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-muted"><UserIcon size={14} className="shrink-0" /> {sub}</p>
          <div className="mt-1.5"><Badge tone={pill.tone}>{pill.text}</Badge></div>
        </div>
        <Money cents={amountCents} hourly={hourly} className="shrink-0 text-[17px]" />
        <ChevronRight size={18} className="shrink-0 text-ink/60" />
      </div>
    </Card>
  );
}

export function DemoModePanel({ gig, viewer }: { gig: Gig; viewer: Viewer }) {
  const s = useStore();
  const me = sessionId();
  const hasPending = s.bids.some((b) => b.gigId === gig.id && b.vendorId === me && b.status === "pending");
  const label = demoLabel(gig, viewer, hasPending);
  if (!label) return null;
  const other = viewer === "requestor" ? "vendor" : "service requestor";
  return (
    <div className="rounded-2xl border border-dashed border-primary/40 bg-white p-4">
      <p className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold text-primary"><FlaskConical size={15} /> Demo mode</p>
      <p className="mb-3 text-[13px] text-muted">Testing alone? Play the {other}&apos;s next step, or open the other account in the phone preview.</p>
      <Button
        size="sm"
        variant="soft"
        onClick={() => {
          const t = demoNextStep(gig.id, viewer);
          if (t) toast(t);
        }}
      >
        {label}
      </Button>
    </div>
  );
}

const ADS: Record<AdSlot, { title: string; body: string; cta: string; href: string; image: string; alt: string; focus: string }> = {
  home_dashboard_bottom: { title: "Winter geyser check: 15% off", body: "Book a verified plumber before the cold sets in.", cta: "Find plumbers", href: "/app/#/find?service=plumbing", image: "/ads/plumbing.jpg", alt: "Smiling tradesman in blue work overalls", focus: "50% 25%" },
  provider_dashboard_bottom: { title: "Grow with NEXO® Promotions", body: "Boost your profile in nearby search results.", cta: "Learn more", href: "/vendor/#/profile", image: "/ads/promote.jpg", alt: "Smiling woman holding her smartphone", focus: "50% 28%" },
  vendor_results_bottom: { title: "Need it done today?", body: "Instant booking. Vendors respond in minutes.", cta: "Post a gig", href: "/app/#/post", image: "/ads/cleaning.jpg", alt: "Cleaner carrying supplies up the stairs", focus: "45% 40%" },
  gig_history_bottom: { title: "Loved your last vendor?", body: "Save them to book again in one tap.", cta: "Browse vendors", href: "/app/#/services", image: "/ads/rebook.jpg", alt: "Two smiling tradeswomen in hard hats", focus: "50% 35%" },
  notifications_bottom: { title: "Safety first", body: "Every gig starts and ends with a one-time code.", cta: "How it works", href: "/safety/", image: "/ads/safety.jpg", alt: "Electrician in protective gear testing a panel", focus: "40% 40%" },
};

export function AdBanner({ slot, className = "mt-6" }: { slot: AdSlot; className?: string }) {
  const ad = ADS[slot];
  const seen = useRef(false);
  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    trackAd(slot, "impressions");
  }, [slot]);
  return (
    <a href={ad.href} onClick={() => trackAd(slot, "clicks")} className={cx("group flex overflow-hidden rounded-2xl border border-line bg-white transition hover:border-primary/40", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static ad images */}
      <img src={ad.image} alt={ad.alt} loading="lazy" decoding="async" width={960} height={640} style={{ objectPosition: ad.focus }} className="w-28 shrink-0 object-cover transition duration-500 group-hover:scale-[1.03]" />
      <div className="min-w-0 flex-1 p-3.5">
        <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted"><Megaphone size={13} /> Sponsored</p>
        <p className="text-[15px] font-bold text-ink">{ad.title}</p>
        <p className="text-[13px] text-muted">{ad.body}</p>
        <p className="mt-1.5 inline-flex items-center gap-0.5 text-[13px] font-semibold text-primary">{ad.cta} <ChevronRight size={14} /></p>
      </div>
    </a>
  );
}

export function FeatureRow({ icon: I, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><I size={19} /></span>
      <div>
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="text-[13px] text-muted">{body}</p>
      </div>
    </div>
  );
}

/** Figma list row (Profile menu): icon tile, label, optional value, chevron. */
export function MenuRow({ icon: I, label, value, href, onClick, danger }: { icon: LucideIcon; label: string; value?: ReactNode; href?: string; onClick?: () => void; danger?: boolean }) {
  // Site pages (/terms/, /safety/…) open in a new tab so the app (and the preview phone) keeps its place.
  const external = !!href && href.startsWith("/");
  const inner = (
    <>
      <span className={cx("inline-flex size-9 shrink-0 items-center justify-center rounded-xl", danger ? "bg-danger/10 text-danger" : "bg-primary-soft text-primary")}><I size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className={cx("block text-[15px] font-semibold", danger ? "text-danger" : "text-ink")}>{label}</span>
        {value && <span className="block truncate text-[13px] text-muted">{value}</span>}
      </span>
      {external ? <ExternalLink size={16} className="text-ink/50" aria-hidden="true" /> : (href || onClick) && !danger && <ChevronRight size={18} className="text-ink/50" />}
    </>
  );
  const cls = "flex w-full items-center gap-3 px-4 py-3 text-left";
  if (href)
    return external ? (
      <a href={href} target="_blank" rel="noopener" className={cls}>{inner}<span className="sr-only"> (opens in a new tab)</span></a>
    ) : (
      <a href={href} className={cls}>{inner}</a>
    );
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}
