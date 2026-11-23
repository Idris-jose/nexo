"use client";
import {
  Bookmark, Camera, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleCheck, CircleX, ClipboardList, Clock, Copy, CreditCard, FileText,
  Gavel, Headset, Heart, House, Image as ImageIcon, KeyRound, LayoutGrid, LoaderCircle, Lock, LogOut, Mail, MapPin, MessageCircle, MessageSquare,
  Pencil, Phone, Plus, Search, Shield, ShieldCheck, Star, Tag, Timer, User as UserIcon, X, Zap,
} from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { use, useMemo, useState, type ReactNode } from "react";
import { browser } from "react-dom";
import {
  cancelGig, confirmPayment, instantBook, postGig, resendCode, selectBid, submitReview, toggleSaved, unselectBid, verifyCompletion,
} from "@/lib/demo/actions";
import { ACTIVE_STATUSES, OPEN_STATUSES, OTP_POLICY, TIMING_LABELS } from "@/lib/demo/constants";
import { fmtCountdown, fmtPhone, gigPrice, statusPill, timeAgo } from "@/lib/demo/format";
import { AREA_KEYS, area, km } from "@/lib/demo/geo";
import { bidBreakdown, formatRand, instantUpfront } from "@/lib/demo/money";
import { nearbyVendors } from "@/lib/demo/ops";
import { proofOfWork, type WorkItem } from "@/lib/demo/portfolio";
import { logout } from "@/lib/demo/session";
import { SERVICES, getService } from "@/lib/demo/services";
import { useStore } from "@/lib/demo/store";
import type { Gig, Timing, User } from "@/lib/demo/types";
import {
  Avatar, Badge, Button, Card, CodeDisplay, EmptyState, Field, FieldError, IconButton, Modal, Money, OtpInput, PersonPhoto, Pills,
  SectionTitle, Segmented, ServiceIcon, StarInput, Stars, StatTile, VerifiedBadge, cx, toast, useTick,
} from "@/components/ui";
import { MapCard } from "@/components/map/MapCard";
import { AppBackButton, Redirect, goBack, navigate, replaceRoute, useHashRoute } from "@/components/demo-app/router";
import { AppShell, PageHeader, RequireRole, type NavItem } from "@/components/demo-app/shell";
import {
  AdBanner, DemoModePanel, GigRow, GigTimeline, LockNote, MenuRow, PaymentBreakdown, PrivateBadge, ProtectionNote, Row,
} from "@/components/demo-app/parts";
import { MessagesPage, NotificationsPage } from "@/components/demo-app/social";
import { HomeHeader } from "@/components/demo-app/home-header";

const TIMING_OPTIONS: { value: Timing; label: string }[] = [
  { value: "asap", label: "ASAP" },
  { value: "this_week", label: "This week" },
  { value: "flexible", label: "Flexible" },
];
const ALEX_ADDRESS = "14 Burnett Street, Hatfield, Pretoria";

/** Figma tab bar: Home, My gigs, Services, Messages, Profile. */
const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: House, match: (r) => r.path === "/" || r.path === "/nearby" },
  { to: "/gigs", label: "My gigs", icon: ClipboardList, match: (r) => r.path.startsWith("/gigs") || r.path.startsWith("/gig/") || r.path === "/post" || r.path === "/new" },
  { to: "/services", label: "Services", icon: LayoutGrid, match: (r) => r.path === "/services" || r.path === "/find" || r.path.startsWith("/vendor/") },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: UserIcon, match: (r) => r.path === "/profile" || r.path === "/support" || r.path === "/saved" },
];

/** Pages that always render a back button (the rest only do with an id, e.g. `/messages/:id`). */
const DETAIL_PAGES = new Set(["new", "post", "nearby", "notifications", "saved", "support"]);

export default function RequestorApp() {
  use(browser("The demo state lives in localStorage."));
  return <RequireRole role="requestor">{(u) => <Router user={u} />}</RequireRole>;
}

function Router({ user }: { user: User }) {
  const route = useHashRoute();
  const [a, b] = route.parts;
  let page;
  if (!a) page = <Home user={user} />;
  else if (a === "new") page = <Redirect to="/post" />; // old chooser; New gig now opens the form directly
  else if (a === "post") page = <PostGig key={route.query.get("service") ?? ""} user={user} preset={route.query.get("service") ?? undefined} />;
  else if (a === "nearby") page = <NearbyMap user={user} />;
  else if (a === "services") page = <AllServices user={user} />;
  else if (a === "find") page = <Providers user={user} slug={route.query.get("service") ?? undefined} />;
  else if (a === "gig" && b) page = <GigDetail user={user} gigId={b} />;
  else if (a === "gigs") page = <MyGigs user={user} />;
  else if (a === "vendor" && b) page = <VendorDetails key={b} user={user} vendorId={b} bidGigId={route.query.get("bid") ?? undefined} />;
  else if (a === "messages") page = <MessagesPage user={user} route={route} viewer="requestor" />;
  else if (a === "notifications") page = <NotificationsPage user={user} back="/" />;
  else if (a === "saved") page = <Saved user={user} />;
  else if (a === "profile") page = <Profile user={user} />;
  else if (a === "support") page = <Support />;
  else page = <EmptyState icon={Search} title="Page not found" action={<Button href="#/">Go home</Button>} />;
  // Detail pages have a back button, so they drop the tab bar.
  const hideTabs = DETAIL_PAGES.has(a ?? "") || ((a === "gig" || a === "vendor" || a === "messages") && !!b);
  return (
    <AppShell app="requestor" nav={NAV} route={route} hideTabs={hideTabs}>
      {page}
    </AppShell>
  );
}

/* ================= Home (Figma Module 01) ================= */
function etaLeft(g: Gig, now: number) {
  return g.status === "traveling" && g.travelStartedAt && g.etaMinutes ? Math.max(1, Math.round(g.etaMinutes - (now - g.travelStartedAt) / 60000)) : null;
}

function gigLine(g: Gig, vendorShort: string | undefined, bids: number, now: number) {
  switch (g.status) {
    case "bidding": return `${bids} ${bids === 1 ? "bid" : "bids"} received · ${area(g.area).suburb}`;
    case "vendor_selected": return `Waiting for ${vendorShort} to accept`;
    case "payment_pending": return `${vendorShort} · confirm payment to book`;
    case "accepted": return `${vendorShort} is getting ready`;
    case "traveling": return `${vendorShort} is on the way · ETA ${etaLeft(g, now)} min`;
    case "start_verification": return `${vendorShort} has arrived, share your code`;
    case "completion_verification": return "Enter the completion code";
    default: return `${vendorShort} · gig in progress`;
  }
}

function Home({ user }: { user: User }) {
  const s = useStore();
  const now = useTick(1000);
  const mine = s.gigs.filter((g) => g.requestorId === user.id);
  const live = mine.filter((g) => ACTIVE_STATUSES.includes(g.status) || OPEN_STATUSES.includes(g.status));
  const [q, setQ] = useState("");
  const nearby = nearbyProviders(s.users, user.area);
  const recommended = useMemo(() => {
    const saved = new Set(user.saved ?? []);
    return [...nearby].sort((x, y) => Number(saved.has(y.id)) - Number(saved.has(x.id)) || y.rating - x.rating).slice(0, 4);
  }, [nearby, user.saved]);
  const search = () => {
    const term = q.trim().toLowerCase();
    const hit = SERVICES.find((sv) => term && (sv.name.toLowerCase().includes(term) || sv.trade.toLowerCase().includes(term) || sv.blurb.toLowerCase().includes(term)));
    location.hash = hit ? `/find?service=${hit.slug}` : "/post";
  };
  return (
    <>
      <HomeHeader user={user} />
      <form role="search" className="relative mb-4" onSubmit={(e) => { e.preventDefault(); search(); }}>
        <label htmlFor="q" className="sr-only">What service are you looking for?</label>
        <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="What service are you looking for?" className="h-12 w-full rounded-xl border border-line bg-field pl-11 pr-4 text-[15px] text-ink outline-none placeholder:text-muted focus:border-primary" />
      </form>
      <AdBanner slot="home_dashboard_bottom" className="mb-6" />

      <section className="mb-6">
        <SectionTitle action="See all" href="#/services">Services</SectionTitle>
        <div className="grid grid-cols-4 gap-2">
          {SERVICES.slice(0, 4).map((sv) => (
            <a key={sv.slug} href={`#/find?service=${sv.slug}`} className="flex flex-col items-center gap-2 text-center">
              <ServiceIcon slug={sv.slug} tile={60} size={26} className="rounded-2xl" />
              <span className="text-[13px] font-semibold text-ink">{sv.name}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <QuickCard href="#/post" icon={Gavel} title="Post a Gig" sub="Get bids from vendors" />
        <QuickCard href="#/find" icon={Zap} title="Find Vendors" sub="Book someone now" />
      </div>

      {live.length > 0 && (
        <section className="mb-6">
          <SectionTitle action="See all" href="#/gigs">Active gigs</SectionTitle>
          <div className="space-y-2.5">
            {live.map((g) => {
              const v = s.users.find((u) => u.id === g.vendorId);
              const bids = s.bids.filter((b) => b.gigId === g.id && b.status === "pending").length;
              const pill = statusPill(g, "requestor");
              return (
                <Card key={g.id} href={`#/gig/${g.id}`} className="p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><ClipboardList size={20} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-ink">{g.title}</p>
                      <p className="line-clamp-2 text-[13px] text-muted">{gigLine(g, v?.short, bids, now)}</p>
                    </div>
                    <Badge tone={pill.tone}>{pill.text}</Badge>
                    <ChevronRight size={18} className="shrink-0 text-ink/60" />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-6">
        <SectionTitle action="See all" href="#/find">Recommended vendors</SectionTitle>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {recommended.map((v) => <ProviderTile key={v.id} v={v} user={user} />)}
        </div>
      </section>

      <section className="mb-2">
        <SectionTitle>Vendors nearby</SectionTitle>
        <a href="#/nearby" aria-label={`Open the map of ${nearby.length} vendors nearby`} className="block transition hover:opacity-95">
          <MapCard
            center={user.area}
            spanKm={16}
            height="h-48"
            markers={[{ area: user.area, kind: "you" }, ...nearby.slice(0, 8).map((v, i) => ({ area: v.area, kind: "person" as const, initials: v.initials, photoId: v.id, hue: 172, seed: i + 2, label: v.short }))]}
            caption={`${nearby.length} vendors nearby · tap to explore`}
          />
        </a>
      </section>

    </>
  );
}

/** Verified, active vendors within 30 km, nearest first. */
function nearbyProviders(users: User[], areaKey: string) {
  return users
    .filter((u) => u.role === "vendor" && u.status === "active" && u.verification?.identity === "verified" && km(u.area, areaKey) <= 30)
    .sort((x, y) => km(x.area, areaKey) - km(y.area, areaKey));
}

/** Home location selector: the area used for nearby providers. */
/* ================= Providers nearby (full map) ================= */
function NearbyMap({ user }: { user: User }) {
  const s = useStore();
  const nearby = nearbyProviders(s.users, user.area);
  const here = area(user.area);
  return (
    <div className="flex h-[calc(100dvh-5.5rem)] flex-col">
      <PageHeader title="Vendors nearby" sub={`${nearby.length} verified vendors around ${here.suburb}`} back="/" />
      <MapCard
        center={user.area}
        spanKm={22}
        spread={2.6}
        height="min-h-[420px] flex-1"
        markers={[
          { area: user.area, kind: "you" },
          ...nearby.map((p, i) => ({
            area: p.area, kind: "person" as const, initials: p.initials, photoId: p.id, hue: 172, seed: i + 2, size: 44,
            label: `${p.short}, ${getService(p.service)?.name}. View profile`,
            onSelect: () => navigate(`/vendor/${p.id}`),
          })),
        ]}
        caption="Tap a vendor to view their profile"
      />
    </div>
  );
}

function QuickCard({ href, icon: I, title, sub }: { href: string; icon: typeof Zap; title: string; sub: string }) {
  return (
    <Card href={href} className="p-3.5">
      <span className="mb-2.5 inline-flex size-10 items-center justify-center rounded-xl bg-ink text-white"><I size={19} /></span>
      <p className="text-[15px] font-bold text-ink">{title}</p>
      <p className="text-[12.5px] text-muted">{sub}</p>
    </Card>
  );
}

/** Figma "Recommended providers" card. */
function ProviderTile({ v, user }: { v: User; user: User }) {
  const saved = user.saved?.includes(v.id);
  return (
    <div className="relative w-[172px] shrink-0 overflow-hidden rounded-2xl border border-line bg-white">
      <a href={`#/vendor/${v.id}`} className="block">
        <PersonPhoto id={v.id} name={v.name} sizes="172px" className="h-[150px] w-full" />
        <div className="p-3">
          <p className="flex items-center gap-1 truncate text-[15px] font-bold text-ink">{v.short} <VerifiedBadge small /></p>
          <p className="truncate text-[13px] text-muted">{getService(v.service)?.name} Services</p>
          <Stars value={v.rating} count={v.reviewCount} className="mt-1" />
          <Money cents={v.rateCents ?? 0} hourly className="mt-0.5 block text-[14px]" />
        </div>
      </a>
      <button type="button" onClick={() => toggleSaved(user.id, v.id)} aria-label={saved ? `Remove ${v.short} from saved` : `Save ${v.short}`} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-primary shadow-soft hover:bg-white">
        <Heart size={17} className={saved ? "fill-primary" : ""} />
      </button>
    </div>
  );
}

/* ================= Post a Gig (Figma Module 03) ================= */
const MAX_PHOTOS = 4;

/** Photo row at the top of the form: thumbnails, then an "Add" tile beside them until the max. Demo photos are placeholders. */
function PhotoUpload({ count, onAdd, onRemove }: { count: number; onAdd: () => void; onRemove: () => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[14px] font-semibold text-ink">Photos <span className="font-normal text-muted">(optional, up to {MAX_PHOTOS})</span></p>
      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="relative flex size-[72px] items-center justify-center rounded-xl bg-primary-soft text-ink/70">
            <ImageIcon size={22} />
            <button type="button" onClick={onRemove} aria-label={`Remove photo ${i + 1}`} className="absolute -right-1.5 -top-1.5 rounded-full bg-ink p-0.5 text-white"><X size={12} /></button>
          </span>
        ))}
        {count < MAX_PHOTOS && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={count ? "Add another photo" : "Add a photo"}
            className="flex size-[72px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 bg-primary-soft/50 text-primary transition hover:border-primary hover:bg-primary-soft"
          >
            <Camera size={20} />
            <span className="text-[11px] font-semibold">{count ? "Add" : "Add photo"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function SelectBox({ id, icon: I, value, onChange, children, invalid }: { id: string; icon: typeof Zap; value: string; onChange: (v: string) => void; children: ReactNode; invalid?: boolean }) {
  return (
    <div className="relative">
      <I size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/70" />
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} className={cx("field appearance-none pl-10 pr-10", !value && "text-muted")}>
        {children}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/70" />
    </div>
  );
}

function PostGig({ user, preset }: { user: User; preset?: string }) {
  const s = useStore();
  const [service, setService] = useState(preset && getService(preset) ? preset : "");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");
  const [timing, setTiming] = useState<Timing>("asap");
  const [areaKey, setAreaKey] = useState(user.area);
  const [address, setAddress] = useState(user.id === "u_alex" ? ALEX_ADDRESS : "");
  const [photos, setPhotos] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const svc = getService(service);
  const available = svc ? s.users.filter((u) => u.role === "vendor" && u.service === service && u.online && u.verification?.identity === "verified" && km(u.area, areaKey) <= 30).length : 0;

  const submit = () => {
    const e: Record<string, string> = {};
    const cents = Number(budget.replace(/\D/g, "")) * 100;
    if (!service) e.service = "Choose a service";
    if (title.trim().length < 3) e.title = "Give the gig a short title";
    if (desc.trim().length < 10) e.description = "Describe the work in a sentence or two";
    if (!cents) e.budget = "Enter your budget in rand";
    else if (cents > 10_000_000) e.budget = "Budget must be under R100,000";
    if (address.trim().length < 6) e.address = "Enter the street address. It stays private.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    const id = postGig(user.id, { service, title: title.trim(), description: desc.trim(), budgetCents: cents, timing, area: areaKey, address: address.trim(), photos });
    toast("Gig posted. Nearby vendors are being notified.");
    replaceRoute(`/gig/${id}`); // back from the new gig skips the (now submitted) form
  };

  return (
    <>
      <PageHeader title="Post a Gig" back="/gigs" />
      <div className="space-y-4">
        <PhotoUpload count={photos} onAdd={() => setPhotos((n) => n + 1)} onRemove={() => setPhotos((n) => n - 1)} />
        <Field label="Service" error={errors.service} htmlFor="svc" hint={svc ? `${available} ${svc.trade.toLowerCase()}${available === 1 ? "" : "s"} verified and online within 30 km of ${area(areaKey).suburb}` : undefined}>
          <SelectBox id="svc" icon={LayoutGrid} value={service} onChange={setService} invalid={!!errors.service}>
            <option value="" disabled>Select a service</option>
            {SERVICES.map((sv) => <option key={sv.slug} value={sv.slug}>{sv.name}</option>)}
          </SelectBox>
        </Field>
        <Field label="Gig title" error={errors.title} htmlFor="t">
          <input id="t" className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you need help with?" aria-invalid={!!errors.title} />
        </Field>
        <Field label="Description" error={errors.description} htmlFor="d">
          <textarea id="d" rows={4} className="field resize-none" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe what needs to be done, including any details that may help the vendor..." aria-invalid={!!errors.description} />
        </Field>
        <Field label="Budget" error={errors.budget} htmlFor="b" hint={svc ? `Typical for ${svc.name.toLowerCase()}: about ${formatRand(svc.typicalCents)}` : undefined}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-ink/70">R</span>
            <input id="b" inputMode="numeric" className="field pl-8" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^\d ,]/g, ""))} placeholder="0.00" aria-invalid={!!errors.budget} />
          </div>
        </Field>
        <Field label="When"><Pills value={timing} onChange={setTiming} options={TIMING_OPTIONS} /></Field>
        <Field label="Service area" htmlFor="a" hint="Vendors see only this suburb and their distance.">
          <SelectBox id="a" icon={MapPin} value={areaKey} onChange={setAreaKey}>
            {AREA_KEYS.map((k) => <option key={k} value={k}>{area(k).suburb}, {area(k).city}</option>)}
          </SelectBox>
        </Field>
        <Field label="Street address" extra={<PrivateBadge />} error={errors.address} htmlFor="ad">
          <input id="ad" className="field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your street address" aria-invalid={!!errors.address} autoComplete="street-address" />
          <div className="mt-2"><LockNote>Your exact address is private and will only be shared with the vendor you book.</LockNote></div>
        </Field>
        <Card className="p-4">
          <p className="text-[15px] font-bold">How bidding works</p>
          <ol className="mt-2.5 space-y-2.5 text-[13px] text-ink/80">
            {["Verified vendors within 30 km get your gig.", "They bid with a price and arrival time.", "Pick a bid. You pay the bid + R20 service fee.", "Payment stays protected until you verify completion."].map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </Card>
        <Button full size="lg" onClick={submit} loading={loading}>Post Gig</Button>
      </div>
    </>
  );
}

/* ================= Providers (Figma Modules 04 + 04b): one list, filtered by category tag ================= */
/* ================= All services ================= */
function AllServices({ user }: { user: User }) {
  const [term, setTerm] = useState("");
  const t = term.trim().toLowerCase();
  const list = SERVICES.filter((sv) => !t || [sv.name, sv.trade, sv.blurb].some((x) => x.toLowerCase().includes(t)));
  return (
    <>
      <PageHeader title="Services" sub={`${SERVICES.length} categories near ${area(user.area).suburb}`} />
      <label className="relative mb-4 block">
        <span className="sr-only">Search services</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search services" className="h-12 w-full rounded-xl border border-line bg-field pl-11 pr-4 text-[15px] text-ink outline-none placeholder:text-muted focus:border-primary" />
      </label>
      {list.length === 0 ? (
        <EmptyState icon={Search} title="No services match" body="Try another word, or post a gig and describe what you need." action={<Button href="#/post">Post a Gig</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((sv) => (
              <Card key={sv.slug} href={`#/find?service=${sv.slug}`} className="flex flex-col gap-2.5 p-3.5">
                <ServiceIcon slug={sv.slug} tile={48} size={22} className="rounded-2xl" />
                <span>
                  <span className="block text-[15px] font-bold text-ink">{sv.name}</span>
                  <span className="line-clamp-2 block text-[12.5px] leading-snug text-muted">{sv.blurb}</span>
                </span>
              </Card>
          ))}
        </div>
      )}
    </>
  );
}

function Providers({ user, slug: wanted }: { user: User; slug?: string }) {
  const s = useStore();
  const slug = wanted && getService(wanted) ? wanted : undefined; // undefined = "All"
  const [term, setTerm] = useState("");
  const all = useMemo(
    () => (slug ? nearbyVendors(s, slug, user.area) : SERVICES.flatMap((sv) => nearbyVendors(s, sv.slug, user.area)).sort((x, y) => +!!y.vendor.online - +!!x.vendor.online || x.km - y.km)),
    [s, slug, user.area],
  );
  const t = term.trim().toLowerCase();
  const list = all.filter(({ vendor: v }) => {
    const sv = getService(v.service);
    return !t || v.name.toLowerCase().includes(t) || !!sv?.name.toLowerCase().includes(t) || !!sv?.trade.toLowerCase().includes(t);
  });
  const svc = slug ? getService(slug) : undefined;
  // Switching tags replaces the entry, so back still leaves the list in one step.
  const pick = (next?: string) => replaceRoute(next ? `/find?service=${next}` : "/find");
  return (
    <>
      <PageHeader
        title="Vendors"
        back={slug ? "/services" : undefined}
        sub={`${all.length} ${svc ? svc.name.toLowerCase() + " " : ""}${all.length === 1 ? "vendor" : "vendors"} near ${area(user.area).suburb}`}
        right={<IconButton icon={Heart} label="Saved vendors" href="#/saved" />}
      />
      <label className="relative mb-3 block">
        <span className="sr-only">Search vendors</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search vendors or services" className="h-12 w-full rounded-xl border border-line bg-field pl-11 pr-4 text-[15px] text-ink outline-none placeholder:text-muted focus:border-primary" />
      </label>
      <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1">
        <CategoryTag on={!slug} onClick={() => pick()}>All</CategoryTag>
        {SERVICES.map((sv) => (
          <CategoryTag key={sv.slug} on={slug === sv.slug} onClick={() => pick(sv.slug)}>{sv.name}</CategoryTag>
        ))}
      </div>
      {all.length === 0 ? (
        <EmptyState icon={Search} title={`No ${svc ? svc.trade.toLowerCase() + "s" : "vendors"} nearby yet`} body="Try another category, or post a gig so vendors can find you." action={<Button href={slug ? `#/post?service=${slug}` : "#/post"}>Post a Gig instead</Button>} />
      ) : list.length === 0 ? (
        <EmptyState icon={Search} title="No vendors match" body="Try another name or service." />
      ) : (
        <div className="space-y-2.5">
          {list.map(({ vendor: v, km: dist }) => <ProviderRow key={v.id} v={v} dist={dist} />)}
        </div>
      )}
      <div className="mt-4"><LockNote>Only distance is shown. Exact locations stay private until a gig is accepted.</LockNote></div>
    </>
  );
}

function CategoryTag({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cx("h-9 shrink-0 rounded-full border px-4 text-[14px] font-semibold transition", on ? "border-primary bg-primary text-white" : "border-line bg-white text-ink hover:border-primary/40")}
    >
      {children}
    </button>
  );
}

function ProviderRow({ v, dist }: { v: User; dist: number }) {
  return (
    <Card href={`#/vendor/${v.id}`} className="grid grid-cols-2 overflow-hidden">
      <PersonPhoto id={v.id} name={v.name} sizes="200px" className="min-h-[156px]" />
      <div className="flex min-w-0 flex-col p-3.5">
        <p className="flex items-center gap-1 text-[16px] font-bold text-ink"><span className="truncate">{v.short}</span> <VerifiedBadge small /></p>
        <p className="truncate text-[13px] text-muted">{getService(v.service)?.trade}</p>
        <Stars value={v.rating} count={v.reviewCount} size={12} className="mt-1" />
        <p className="mt-1 flex items-center gap-1 text-[13px] text-muted"><MapPin size={13} /> {dist} km away</p>
        <Money cents={v.rateCents ?? 0} hourly className="mt-1 text-[15px]" />
        <div className="mt-auto pt-2">{v.online ? <Badge icon={CircleCheck}>Available</Badge> : <Badge tone="gray" icon={CircleX}>Not available</Badge>}</div>
      </div>
    </Card>
  );
}

/* ================= Vendor details (Figma Module 05) + Request sheet (Module 06.1) ================= */
function Collapsible({ title, right, children, open: initial = true }: { title: string; right?: ReactNode; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <Card className="p-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={open}>
        <span className="text-[16px] font-bold text-ink">{title}</span>
        <span className="flex items-center gap-2">{right}{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </Card>
  );
}

function ReviewItem({ g }: { g: Gig }) {
  const s = useStore();
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[14px] font-bold text-ink"><Avatar id={g.requestorId} size={26} />{s.users.find((u) => u.id === g.requestorId)?.short}</span>
        <StarInput value={g.review!.rating} size={14} />
      </div>
      <p className="mt-0.5 text-[13.5px] text-ink/80">{g.review!.text}</p>
      <p className="text-xs text-muted">{g.title} · {timeAgo(g.review!.at)}</p>
    </div>
  );
}

/** Latest two reviews inline; the rest open in a sheet (same pattern as the status timeline). Collapsed by default. */
function ReviewsCard({ v, reviewed }: { v: User; reviewed: Gig[] }) {
  const [all, setAll] = useState(false);
  const summary = v.rating ? `${v.rating.toFixed(1)} · ${v.reviewCount} reviews` : undefined;
  return (
    <Collapsible title="Reviews" open={false} right={summary && <span className="text-[13px] font-semibold text-primary">{summary}</span>}>
      {reviewed.length === 0 ? (
        <p className="text-sm text-muted">No written reviews yet.</p>
      ) : (
        <div className="space-y-3.5">{reviewed.slice(0, 2).map((g) => <ReviewItem key={g.id} g={g} />)}</div>
      )}
      {reviewed.length > 2 && (
        <button type="button" onClick={() => setAll(true)} className="mt-3 text-[14px] font-semibold text-primary hover:underline">See all reviews ({reviewed.length})</button>
      )}
      <Modal open={all} onClose={() => setAll(false)} title="Reviews">
        {summary && <p className="-mt-3 mb-4 text-[13.5px] text-muted">{v.short} · {summary}</p>}
        <div className="space-y-4">{reviewed.map((g) => <ReviewItem key={g.id} g={g} />)}</div>
      </Modal>
    </Collapsible>
  );
}

function WorkPhoto({ item, slug, sizes, className }: { item: WorkItem; slug?: string; sizes: string; className?: string }) {
  return (
    <span className={cx("relative block overflow-hidden bg-primary-soft", className)}>
      {item.photo ? (
        <NextImage src={item.photo} alt={item.title} fill sizes={sizes} className="object-cover" />
      ) : (
        <ServiceIcon slug={slug ?? ""} size={22} tile={40} className="absolute inset-0 m-auto bg-white/70" />
      )}
    </span>
  );
}

const WORK_THUMBS = 4;

/** Past job photos, in the same accordion style as About and Reviews. */
function ProofOfWork({ v }: { v: User }) {
  const items = proofOfWork(v);
  const [viewing, setViewing] = useState<number | null>(null);
  const item = viewing == null ? undefined : items[viewing];
  const extra = items.length - WORK_THUMBS;
  return (
    <Collapsible title="Proof of work">
      {items.length === 0 ? (
        <p className="text-sm text-muted">No job photos yet. They appear here after {v.short}&apos;s first completed gigs.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {items.slice(0, WORK_THUMBS).map((w, i) => (
            <button key={w.title} type="button" onClick={() => setViewing(i)} aria-label={w.title} className="relative overflow-hidden rounded-xl">
              <WorkPhoto item={w} slug={v.service} sizes="110px" className="aspect-square w-full" />
              {i === WORK_THUMBS - 1 && extra > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-[15px] font-bold text-white">+{extra}</span>
              )}
            </button>
          ))}
        </div>
      )}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <ShieldCheck size={14} className="shrink-0 text-primary" />
        {items.length > 0 ? "From verified NEXO® gigs · " : ""}On NEXO® since {v.joined}
      </p>
      <Modal open={!!item} onClose={() => setViewing(null)} title={item?.title ?? ""}>
        {item && viewing != null && (
          <>
            <WorkPhoto item={item} slug={v.service} sizes="440px" className="aspect-[4/3] w-full rounded-2xl" />
            <p className="mt-3 text-[14px] text-ink/80">{item.detail}</p>
            {items.length > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <IconButton icon={ChevronLeft} label="Previous job" onClick={() => setViewing((viewing + items.length - 1) % items.length)} />
                <span className="text-[13px] font-semibold text-muted">{viewing + 1} / {items.length}</span>
                <IconButton icon={ChevronRight} label="Next job" onClick={() => setViewing((viewing + 1) % items.length)} />
              </div>
            )}
          </>
        )}
      </Modal>
    </Collapsible>
  );
}

function VendorDetails({ user, vendorId, bidGigId }: { user: User; vendorId: string; bidGigId?: string }) {
  const s = useStore();
  const [requesting, setRequesting] = useState(false);
  const v = s.users.find((u) => u.id === vendorId);
  if (!v || v.role !== "vendor") return <EmptyState icon={Search} title="Vendor not found" action={<Button href="#/find">Find vendors</Button>} />;
  const svc = getService(v.service);
  const reviewed = s.gigs.filter((g) => g.vendorId === v.id && g.review).sort((a, b) => b.review!.at - a.review!.at);
  const saved = user.saved?.includes(v.id);
  // Opened from a bid on one of the user's gigs: that is the bid flow, so no direct "Request" here.
  const bidGig = bidGigId ? s.gigs.find((g) => g.id === bidGigId && g.requestorId === user.id) : undefined;
  const bid = bidGig && s.bids.find((b) => b.gigId === bidGig.id && b.vendorId === v.id && b.status === "pending");
  return (
    <>
      <PageHeader
        title="Vendor details"
        back={bidGig ? `/gig/${bidGig.id}` : `/find?service=${v.service}`}
        right={
          <button type="button" onClick={() => toggleSaved(user.id, v.id)} aria-label={saved ? "Saved" : "Save vendor"} className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-white text-primary">
            <Heart size={19} className={saved ? "fill-primary" : ""} />
          </button>
        }
      />
      <div className="mb-5 flex flex-col items-center text-center">
        <PersonPhoto id={v.id} name={v.name} sizes="440px" className="aspect-[4/3] w-full rounded-2xl" />
        <p className="mt-4 flex items-center gap-1.5 font-display text-[24px] font-bold text-ink">{v.short} <VerifiedBadge small /></p>
        <p className="text-[15px] text-muted">{svc?.trade} · {area(v.area).suburb} · {km(v.area, user.area)} km away</p>
        <div className="mt-2">{v.online ? <Badge icon={CircleCheck}>Available</Badge> : <Badge tone="gray" icon={CircleX}>Not available</Badge>}</div>
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2.5">
        <MiniStat icon={Star} value={v.rating ? v.rating.toFixed(1) : "New"} label="Rating" />
        <MiniStat icon={CircleCheck} value={String(v.completed)} label="Jobs completed" />
        <MiniStat icon={MessageSquare} value={`${v.responseRate ?? 100}%`} label="Response rate" />
      </div>
      <Card className="mb-3 flex items-center justify-between p-4">
        <span className="flex items-center gap-2 text-[15px] font-bold text-ink"><Tag size={18} className="text-primary" /> Hourly rate</span>
        <span className="font-display text-[20px] font-bold text-ink">{formatRand(v.rateCents ?? 0)} <span className="font-sans text-sm font-medium text-muted">/ hr</span></span>
      </Card>
      <div className="space-y-3">
        <Collapsible title="About">
          <p className="text-[14px] text-ink/80">{v.bio ?? `${svc?.trade} on NEXO®.`}</p>
          {!!v.certifications?.length && <div className="mt-3 flex flex-wrap gap-2">{v.certifications.map((c) => <Badge key={c} icon={ShieldCheck}>{c}</Badge>)}</div>}
        </Collapsible>
        <ProofOfWork v={v} />
        <ReviewsCard v={v} reviewed={reviewed} />
      </div>
      <div className="sticky bottom-0 -mx-5 mt-5 bg-gradient-to-t from-cream via-cream to-cream/0 px-5 pb-3 pt-4">
        {bidGig ? (
          <>
            <p className="mb-2 text-center text-[13px] text-muted">
              {bid ? <>Bid on <span className="font-semibold text-ink">{bidGig.title}</span>: {formatRand(bid.amountCents)} · ETA {bid.etaMinutes} min</> : <>Viewing a bidder on <span className="font-semibold text-ink">{bidGig.title}</span></>}
            </p>
            {bid ? (
              <Button full size="lg" onClick={() => { selectBid(bid.id); replaceRoute(`/gig/${bidGig.id}`); }}>Accept bid</Button>
            ) : (
              <Button full size="lg" variant="secondary" onClick={() => goBack(`/gig/${bidGig.id}`)}>Back to bids</Button>
            )}
          </>
        ) : (
          <Button full size="lg" disabled={!v.online} onClick={() => setRequesting(true)}>{v.online ? "Request vendor" : "Currently offline"}</Button>
        )}
      </div>
      {requesting && <RequestSheet user={user} vendor={v} onClose={() => setRequesting(false)} />}
    </>
  );
}

function MiniStat({ icon: I, value, label }: { icon: typeof Star; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-white px-2 py-3 text-center">
      <I size={18} className="text-primary" />
      <p className="mt-1 font-display text-[20px] font-bold text-ink">{value}</p>
      <p className="text-[12px] text-muted">{label}</p>
    </div>
  );
}

function RequestSheet({ user, vendor, onClose }: { user: User; vendor: User; onClose: () => void }) {
  const svc = getService(vendor.service)!;
  const [desc, setDesc] = useState("");
  const [timing, setTiming] = useState<Timing>("asap");
  const [address, setAddress] = useState(user.id === "u_alex" ? ALEX_ADDRESS : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const up = instantUpfront(vendor.rateCents ?? 0);
  const send = () => {
    const e: Record<string, string> = {};
    if (desc.trim().length < 10) e.description = "Describe the work in a sentence or two";
    if (address.trim().length < 6) e.address = "Enter the street address. It stays private.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = instantBook(user.id, vendor.id, { service: svc.slug, title: `${svc.name} request`, description: desc.trim(), timing, area: user.area, address: address.trim(), photos: 0 });
    toast(`Request sent to ${vendor.short}`);
    onClose();
    navigate(`/gig/${id}`);
  };
  return (
    <Modal open onClose={onClose} title="Request Vendor">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
          <Avatar name={vendor.name} id={vendor.id} size={44} />
          <div>
            <p className="text-[15px] font-bold text-ink">{vendor.short}</p>
            <p className="text-[13px] text-muted">{svc.trade}</p>
          </div>
        </div>
        <Field label="Describe the job" error={errors.description} htmlFor="rd">
          <textarea id="rd" rows={4} className="field resize-none" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe what you need the vendor to do..." aria-invalid={!!errors.description} />
        </Field>
        <Field label="When"><Pills value={timing} onChange={setTiming} options={TIMING_OPTIONS} /></Field>
        <Field label="Street address" extra={<PrivateBadge />} error={errors.address} htmlFor="ra">
          <input id="ra" className="field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your street address" aria-invalid={!!errors.address} />
          <div className="mt-2"><LockNote>Your address will only be shared with the vendor you book, after they accept and you make payment.</LockNote></div>
        </Field>
        <Card className="p-4">
          <p className="mb-1 text-[15px] font-bold text-ink">Price summary</p>
          <Row k="First hour (vendor hourly rate)" v={formatRand(up.firstHourCents)} />
          <Row k="Service fee" v={formatRand(up.serviceFeeCents)} />
          <div className="my-1.5 border-t border-line" />
          <Row k="Total due upon acceptance" v={formatRand(up.totalCents)} sub="First hour + R20" strong />
          <p className="mt-2 text-xs text-muted">The R20 service fee is non-refundable. Payment is due when the vendor accepts. Remaining time is billed in 15-minute increments after completion.</p>
        </Card>
        <Button full size="lg" onClick={send}>Send request</Button>
      </div>
    </Modal>
  );
}

/* ================= Gig flow (Figma Module 06) ================= */
function GigDetail({ user, gigId }: { user: User; gigId: string }) {
  const s = useStore();
  useTick(5000);
  const gig = s.gigs.find((g) => g.id === gigId && g.requestorId === user.id);
  if (!gig) return <EmptyState icon={Search} title="Gig not found" body="It may have been removed." action={<Button href="#/gigs">Your gigs</Button>} />;
  const v = s.users.find((u) => u.id === gig.vendorId);
  const pill = statusPill(gig, "requestor");
  const cancellable = ["bidding", "vendor_selected", "payment_pending"].includes(gig.status);
  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <AppBackButton fallback="/gigs" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[22px] font-bold leading-tight text-ink">Gig Details</h1>
          <p className={cx("truncate text-[13px] font-semibold", gig.status === "completed" || gig.status === "cancelled" ? "text-muted" : "text-primary")}>{pill.text}</p>
        </div>
      </div>
      <div className="space-y-4">
        <GigDetailsCard gig={gig} collapsed={gig.status !== "bidding"} />
        {v && gig.status !== "bidding" && <PersonCard v={v} gig={gig} />}
        <StatusPanel gig={gig} v={v} />
        {(ACTIVE_STATUSES.includes(gig.status) || gig.status === "completed") && <Card className="p-4"><GigTimeline gig={gig} viewer="requestor" /></Card>}
        <DemoModePanel gig={gig} viewer="requestor" />
        {cancellable && (
          <Button full size="lg" variant="danger" onClick={() => { if (confirm("Cancel this gig?")) { cancelGig(gig.id); toast("Gig cancelled"); } }}>Cancel gig</Button>
        )}
      </div>
    </>
  );
}

function GigDetailsCard({ gig, collapsed }: { gig: Gig; collapsed?: boolean }) {
  const [open, setOpen] = useState(!collapsed);
  return (
    <Card className="p-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 text-left" aria-expanded={open}>
        <span className="flex min-w-0 items-center gap-3">
          <ServiceIcon slug={gig.service} tile={40} size={19} />
          <span className="min-w-0">
            <span className="block text-[17px] font-bold leading-snug text-ink">{gig.title}</span>
            <span className="block text-[13px] text-muted">{getService(gig.service)?.name} · {gig.ref}</span>
          </span>
        </span>
        {open ? <ChevronUp size={18} className="mt-1 shrink-0" /> : <ChevronDown size={18} className="mt-1 shrink-0" />}
      </button>
      {open && (
        <div className="mt-3 border-t border-line pt-2">
          <Row k={gig.mode === "bid" ? "Budget" : "Hourly rate"} v={gig.mode === "bid" ? formatRand(gig.budgetCents ?? 0) : `${formatRand(gig.hourlyRateCents ?? 0)}/hr`} />
          <Row k="When" v={TIMING_LABELS[gig.timing]} />
          <Row k="Area" v={area(gig.area).suburb} />
          {gig.photos > 0 && (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-ink/80">Photos</span>
              <span className="flex gap-1.5">
                {Array.from({ length: gig.photos }).map((_, i) => <span key={i} className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-ink/60"><ImageIcon size={16} /></span>)}
              </span>
            </div>
          )}
          <Row k="Address" v={gig.address} />
          <p className="mt-2 border-t border-line pt-2 text-[13px] text-ink/80">{gig.description}</p>
        </div>
      )}
    </Card>
  );
}

function StatusPanel({ gig, v }: { gig: Gig; v?: User }) {
  const s = useStore();
  switch (gig.status) {
    case "bidding": {
      const bids = s.bids.filter((b) => b.gigId === gig.id && b.status === "pending").sort((a, b) => a.amountCents - b.amountCents);
      return (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[17px] font-bold text-ink">Bids received ({bids.length})</p>
            <Badge icon={LoaderCircle} className="[&_svg]:animate-spin">Live</Badge>
          </div>
          {bids.length === 0 ? (
            <Card className="flex flex-col items-center px-5 py-8 text-center">
              <LoaderCircle className="mb-3 animate-spin text-primary" size={28} />
              <p className="font-bold">Waiting for bids…</p>
              <p className="text-sm text-muted">Nearby vendors have been notified. New bids appear here instantly.</p>
            </Card>
          ) : (
            bids.map((b) => {
              const bv = s.users.find((u) => u.id === b.vendorId)!;
              return (
                <Card key={b.id} className="animate-rise p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={bv.name} id={bv.id} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-[15px] font-bold text-ink">{bv.short} <VerifiedBadge small /></p>
                      <Stars value={bv.rating} count={bv.reviewCount} size={12} />
                    </div>
                    <Money cents={b.amountCents} className="text-[20px]" />
                  </div>
                  <p className="mt-2.5 flex items-center gap-3 text-[13px] text-muted">
                    <span className="inline-flex items-center gap-1"><Clock size={13} /> ETA {b.etaMinutes} min</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={13} /> {km(bv.area, gig.area)} km</span>
                  </p>
                  {b.note && <p className="mt-2 text-[13.5px] text-ink/80">&quot;{b.note}&quot;</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button onClick={() => selectBid(b.id)}>Accept bid</Button>
                    <Button variant="secondary" href={`#/vendor/${bv.id}?bid=${gig.id}`}>View profile</Button>
                  </div>
                </Card>
              );
            })
          )}
        </>
      );
    }
    case "vendor_selected":
      return (
        <Card className="flex flex-col items-center px-5 py-8 text-center">
          <LoaderCircle className="mb-3 animate-spin text-primary" size={30} />
          <p className="text-[17px] font-bold">Waiting for {v?.short} to accept</p>
          <p className="mt-1 text-sm text-muted">You’ll be asked to confirm payment once they accept. Nothing is charged yet.</p>
        </Card>
      );
    case "payment_pending":
      return <Payment gig={gig} />;
    case "cancelled":
      return (
        <Card className="flex items-center gap-3 p-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger"><X size={20} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-ink">This gig was cancelled</p>
            <p className="text-[13px] text-muted">No service fee was charged.</p>
          </div>
          <Button href="#/post" size="sm">Post again</Button>
        </Card>
      );
    case "completed":
      return <RateAndReview gig={gig} v={v!} />;
    default:
      return <Tracking gig={gig} v={v!} />;
  }
}

/** The other person on the gig, near the top, with quick contact actions. */
function PersonCard({ v, gig }: { v: User; gig: Gig }) {
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <a href={`#/vendor/${v.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={v.name} id={v.id} size={48} />
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-[15px] font-bold text-ink"><span className="truncate">{v.short}</span> <VerifiedBadge small /></span>
          <span className="block truncate text-[13px] text-muted">{getService(v.service)?.trade} · ★ {v.rating.toFixed(1)}</span>
        </span>
      </a>
      <IconButton icon={Phone} label={`Call ${v.short}`} onClick={() => toast("Calls are masked in production. Demo only.")} />
      <IconButton icon={MessageCircle} label={`Message ${v.short}`} href={`#/messages/${gig.id}`} />
    </Card>
  );
}

/* Figma Module 06.3 Payment */
function Payment({ gig }: { gig: Gig }) {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12 / 28");
  const bid = gig.mode === "bid" ? bidBreakdown(gig.agreedCents!) : null;
  const inst = gig.mode === "instant" ? instantUpfront(gig.hourlyRateCents!) : null;
  const total = bid ? bid.requestorTotalCents : inst!.totalCents;
  const pay = () => {
    setLoading(true);
    setTimeout(() => {
      confirmPayment(gig.id);
      toast("Payment confirmed. Gig booked.");
    }, 700);
  };
  return (
    <>
      <Card className="p-4">
        <p className="mb-1 text-[16px] font-bold text-ink">Payment summary</p>
        {bid ? <Row k="Accepted bid" v={formatRand(bid.serviceCents)} /> : <Row k={`First hour at ${formatRand(gig.hourlyRateCents!)}/hr`} v={formatRand(inst!.firstHourCents)} />}
        <Row k="Service fee" v={formatRand(2000)} />
        <div className="my-1.5 border-t border-line" />
        <Row k="Total to pay" v={formatRand(total)} sub={bid ? "Bid + R20" : "First hour + R20"} strong />
      </Card>
      <Card className="space-y-3 p-4">
        <p className="flex items-center gap-2 text-[16px] font-bold text-ink"><CreditCard size={18} className="text-primary" /> Card details</p>
        <Field label="Card number" htmlFor="cc">
          <input id="cc" inputMode="numeric" className="field font-mono" value={card} onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, "").slice(0, 19))} placeholder="1234 5678 9012 3456" />
        </Field>
        <Field label="Expiry date" htmlFor="exp">
          <input id="exp" inputMode="numeric" className="field font-mono" value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0, 7))} placeholder="MM / YY" />
        </Field>
        <p className="text-xs text-muted">Demo mode: a test card is prefilled and no real money moves.</p>
      </Card>
      <ProtectionNote>Payment is held until the job is completed and confirmed. It is not released to the vendor when you pay.</ProtectionNote>
      <Button full size="lg" onClick={pay} loading={loading}>Pay {formatRand(total)}</Button>
      {gig.mode === "bid" && <Button full variant="secondary" onClick={() => unselectBid(gig.id)}>Choose another bid</Button>}
    </>
  );
}

/* Tracking (accepted / traveling / start code / active / completion), Figma Module 06.4 for the start code */
function Tracking({ gig, v }: { gig: Gig; v: User }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const now = useTick(1000);
  const left = etaLeft(gig, now);
  const progress = gig.status === "accepted" ? 0.02 : gig.status === "traveling" && left != null ? Math.min(0.92, 1 - left / (gig.etaMinutes ?? 1)) : 1;
  const headline =
    gig.status === "accepted" ? `${v.short} is getting ready`
      : gig.status === "traveling" ? `${v.short} is on the way`
        : gig.status === "start_verification" ? `${v.short} has arrived`
          : gig.status === "active" ? "Gig in progress" : `${v.short} marked the gig complete`;
  const verify = () => {
    const r = verifyCompletion(gig.id, code);
    if (r.ok) toast("Completion verified. Payment released.");
    else {
      setError(r.error);
      setCode("");
    }
  };
  const travelling = gig.status === "accepted" || gig.status === "traveling";

  if (gig.status === "start_verification" && gig.startOtp) {
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(gig.startOtp!.code);
        toast("Start code copied");
      } catch {
        toast(`Your start code is ${gig.startOtp!.code}`);
      }
    };
    return (
      <>
        <div className="flex flex-wrap gap-2"><Badge icon={CircleCheck}>Payment received</Badge><Badge icon={MapPin}>Vendor has arrived</Badge></div>
        <Card className="p-5 text-center">
          <p className="mx-auto max-w-sm text-[14px] text-ink/80">Share this code with your vendor when they are ready to begin the job. They enter it to start the job.</p>
          <div className="my-5"><CodeDisplay code={gig.startOtp.code} /></div>
          <p className="text-[13px] text-muted">This is your start code. It is different from the completion code you use later.</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted">
            <Timer size={13} /> Expires in {fmtCountdown(gig.startOtp.expiresAt - now)} · attempts left {OTP_POLICY.maxAttempts - gig.startOtp.attempts}
          </p>
        </Card>
        <Button full size="lg" icon={Copy} onClick={copy}>Copy code</Button>
        <Button full variant="ghost" onClick={() => { const r = resendCode(gig.id, "start"); toast(r.ok ? "New start code issued" : r.error); }}>Issue a new code</Button>
      </>
    );
  }

  return (
    <>
      <div>
        <p className="text-[17px] font-bold text-ink">{headline}</p>
        {gig.status === "traveling" && left != null && <p className="text-[13px] text-muted">ETA {left} min · {km(v.area, gig.area)} km</p>}
      </div>
      {travelling && (
        <MapCard center={gig.area} spanKm={12} height="h-60" markers={[{ area: gig.area, kind: "destination", label: "Your address" }]} route={{ from: v.area, to: gig.area }} progress={progress} caption="Route is approximate for privacy" />
      )}
      {travelling && (
        <Card className="flex gap-3 bg-primary-soft p-4">
          <ShieldCheck className="shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold text-primary">Next step</p>
            <p className="font-bold">Arrival at Location</p>
            <p className="text-[13px] text-muted">When {v.short} arrives you’ll get a 6-digit start code to share with them.</p>
          </div>
        </Card>
      )}
      {gig.status === "completion_verification" && (
        <Card className="p-5 text-center">
          <Badge tone="gold" icon={CircleCheck}>Vendor marked the gig complete</Badge>
          <p className="mt-3 font-display text-xl font-bold">Verify completion</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Check the work, then enter the 6-digit code {v.short} gives you. This releases their payment.</p>
          <div className="my-5"><OtpInput value={code} onChange={(c) => { setCode(c); setError(undefined); }} invalid={!!error} /></div>
          {error && <div className="flex justify-center"><FieldError>{error}</FieldError></div>}
          <Button size="lg" full className="mt-3" disabled={code.length !== 6} onClick={verify} icon={ShieldCheck}>Verify &amp; release payment</Button>
          <p className="mt-3 text-xs text-muted">Check Messages. Your vendor can send the code there.</p>
        </Card>
      )}
    </>
  );
}

/* Figma Module 06.7 Rate and review */
const reviewSkipKey = (gigId: string) => `nexo.reviewSkipped.${gigId}`;

function RateAndReview({ gig, v }: { gig: Gig; v: User }) {
  // The review pops up once the gig completes; closing it with X skips it (a small "Rate" card stays on the page).
  const [open, setOpen] = useState(() => !gig.review && !sessionStorage.getItem(reviewSkipKey(gig.id)));
  const close = () => {
    sessionStorage.setItem(reviewSkipKey(gig.id), "1");
    setOpen(false);
  };
  return (
    <>
      <div className="flex items-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-[14px] font-semibold text-primary-dark">
        <CircleCheck size={20} className="animate-pop" /> Gig completed. Payment released to {v.short.replace(/\.$/, "")}.
      </div>
      {gig.review ? (
        <Card className="p-5 text-center">
          <p className="text-[15px] font-bold">Your review</p>
          <div className="my-3 flex justify-center"><StarInput value={gig.review.rating} size={28} /></div>
          {gig.review.text && <p className="text-sm text-ink/80">&quot;{gig.review.text}&quot;</p>}
        </Card>
      ) : (
        <Card className="flex items-center gap-3 p-4">
          <Star size={20} className="shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-[14px] font-semibold text-ink">How was {v.short}?</p>
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>Rate</Button>
        </Card>
      )}
      <Card className="p-4">
        <p className="mb-1 text-[16px] font-bold">Payment summary</p>
        <PaymentBreakdown gig={gig} viewer="requestor" />
        <div className="mt-3"><ProtectionNote>Payment was protected until service completion. Now released.</ProtectionNote></div>
      </Card>
      {open && !gig.review && <ReviewSheet gig={gig} v={v} onClose={close} />}
    </>
  );
}

function ReviewSheet({ gig, v, onClose }: { gig: Gig; v: User; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  return (
    <Modal open onClose={onClose} title={`Rate ${v.short}`}>
      <div className="-mt-2 mb-4 flex items-center gap-3">
        <Avatar name={v.name} id={v.id} size={44} />
        <p className="min-w-0 text-[13.5px] text-muted">{gig.title} · {gig.ref}</p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-center"><StarInput value={rating} onChange={setRating} /></div>
        <Field label="Written review (optional)" htmlFor="rv">
          <textarea id="rv" rows={3} className="field resize-none" value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience with this vendor..." />
        </Field>
        <Button full size="lg" disabled={!rating} onClick={() => { submitReview(gig.id, rating, text.trim()); toast("Thanks, review submitted"); }}>Submit review</Button>
      </div>
    </Modal>
  );
}

/* ================= My Gigs (Figma Module 02) ================= */
function MyGigs({ user }: { user: User }) {
  const s = useStore();
  const [tab, setTab] = useState<"active" | "bids" | "completed">("active");
  const mine = s.gigs.filter((g) => g.requestorId === user.id).sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt));
  // Active = booked or being booked; Receiving Bids = still collecting offers; Completed = finished (and cancelled) gigs.
  const tabOf = (g: Gig) => (g.status === "bidding" ? "bids" : g.status === "completed" || g.status === "cancelled" ? "completed" : "active");
  const activeCount = mine.filter((g) => tabOf(g) !== "completed").length;
  const pastCount = mine.filter((g) => g.status === "completed").length;
  const gigs = mine.filter((g) => tabOf(g) === tab);
  return (
    <>
      <PageHeader title="My Gigs" right={<Button href="#/post" icon={Plus} size="sm" className="h-10">New gig</Button>} />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatTile icon={ClipboardList} value={activeCount} label="Active gigs" />
        <StatTile icon={CircleCheck} value={pastCount} label="Past gigs" />
      </div>
      <Segmented className="mb-4" value={tab} onChange={setTab} options={[{ value: "active", label: "Active" }, { value: "bids", label: "Receiving Bids" }, { value: "completed", label: "Completed" }]} />
      {gigs.length === 0 ? (
        <EmptyState icon={ClipboardList} title={tab === "bids" ? "No gigs receiving bids" : tab === "completed" ? "No completed gigs yet" : "No active gigs"} body="Post a gig or book a vendor and it will show up here." action={<Button href="#/post" icon={Plus}>New gig</Button>} />
      ) : (
        <div className="space-y-2.5">
          {gigs.map((g) => {
            const v = s.users.find((u) => u.id === g.vendorId);
            const p = gigPrice(g);
            return <GigRow key={g.id} gig={g} viewer="requestor" href={`#/gig/${g.id}`} amountCents={p.cents} hourly={p.hourly} sub={`${v ? v.short : "No vendor yet"} · ${g.ref}`} />;
          })}
        </div>
      )}
    </>
  );
}

/* ================= Saved providers ================= */
function Saved({ user }: { user: User }) {
  const s = useStore();
  const vendors = (user.saved ?? []).map((id) => s.users.find((u) => u.id === id)).filter((u): u is User => !!u);
  return (
    <>
      <PageHeader title="Saved vendors" sub="Book people you trust again in one tap." back="/profile" />
      {vendors.length === 0 ? (
        <EmptyState icon={Heart} title="No saved vendors" body="Tap the heart on any vendor to save them here." action={<Button href="#/find">Find vendors</Button>} />
      ) : (
        <div className="space-y-2.5">
          {vendors.map((v) => (
            <div key={v.id} className="relative">
              <ProviderRow v={v} dist={km(v.area, user.area)} />
              <button
                type="button"
                onClick={() => { toggleSaved(user.id, v.id); toast(`${v.short} removed from saved`); }}
                aria-label={`Remove ${v.short} from saved`}
                className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 text-primary shadow-soft hover:bg-white"
              >
                <Heart size={17} className="fill-primary" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ================= Profile (Figma Module 08) ================= */
function Profile({ user }: { user: User }) {
  const s = useStore();
  const router = useRouter();
  const gigs = s.gigs.filter((g) => g.requestorId === user.id);
  const protectedCents = s.payments.filter((p) => p.payerId === user.id && p.status === "authorized").reduce((n, p) => n + p.amountCents, 0);
  const spent = s.payments.filter((p) => p.payerId === user.id && p.status === "captured").reduce((n, p) => n + p.amountCents, 0);
  const a = area(user.area);
  return (
    <>
      <PageHeader title="Profile" />
      <Card className="mb-4 flex flex-col items-center p-5 text-center">
        <Avatar name={user.name} id={user.id} size={88} letter={user.name[0]} />
        <p className="mt-3 font-display text-[22px] font-bold text-ink">{user.name}</p>
        <p className="text-[14px] text-muted">{a.suburb}, {a.city}</p>
        <div className="mt-1"><Stars value={user.rating} count={user.reviewCount} /></div>
        <Button size="sm" variant="secondary" icon={Pencil} className="mt-3" onClick={() => toast("Profile editing launches with the live backend")}>Edit profile</Button>
      </Card>
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <MiniStat icon={ClipboardList} value={String(gigs.length)} label="Gigs" />
        <MiniStat icon={Lock} value={formatRand(protectedCents)} label="Protected" />
        <MiniStat icon={Star} value={formatRand(spent)} label="Spent" />
      </div>
      <Card className="mb-3 divide-y divide-line overflow-hidden">
        <MenuRow icon={Phone} label="Phone number" value={fmtPhone(user.phone)} />
        <MenuRow icon={UserIcon} label="Account type" value="Requestor" />
        <MenuRow icon={Bookmark} label="Saved vendors" value={`${user.saved?.length ?? 0} saved`} href="#/saved" />
        <MenuRow icon={CreditCard} label="Payment methods" value="Requested only when you book" />
      </Card>
      <Card className="mb-3 divide-y divide-line overflow-hidden">
        <MenuRow icon={KeyRound} label="Change password" onClick={() => toast("NEXO® signs you in with a one-time code, so there is no password to change.")} />
        <MenuRow icon={Shield} label="Account security" href="/safety/" />
      </Card>
      <Card className="mb-4 divide-y divide-line overflow-hidden">
        <MenuRow icon={Headset} label="Help & Support" value="24/7, support@gig.demo" href="#/support" />
        <MenuRow icon={Mail} label="Contact Us" href="/contact/" />
        <MenuRow icon={FileText} label="Terms & Conditions" href="/terms/" />
        <MenuRow icon={Lock} label="Privacy Policy" href="/privacy/" />
      </Card>
      <Button full size="lg" variant="danger" icon={LogOut} onClick={() => { logout(); router.push("/login/"); }}>Log out</Button>
    </>
  );
}

/* ================= Support (Profile → Help & Support) ================= */
function Support() {
  return (
    <>
      <PageHeader title="Support" back="/profile" />
      <p className="mb-3 text-[15px] font-bold text-ink">How can we help you?</p>
      <Card className="divide-y divide-line overflow-hidden">
        <MenuRow icon={MessageCircle} label="Chat with us" value="Online" onClick={() => toast("Live chat launches with the live backend. Email us in the meantime.")} />
        <MenuRow icon={Phone} label="Call us" value="Available 24/7" onClick={() => toast("Calls are masked in production. Demo only.")} />
        <MenuRow icon={Mail} label="Email us" value="support@gig.demo" href="mailto:support@gig.demo" />
        <MenuRow icon={ShieldCheck} label="Safety & how it works" value="Codes, payment protection, verification" href="/safety/" />
      </Card>
    </>
  );
}
