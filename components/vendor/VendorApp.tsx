"use client";
import {
  BadgeCheck, Banknote, Briefcase, Camera, ChevronDown, ChevronUp, CircleCheck, FileText, Gavel, Headset, House,
  LoaderCircle, Lock, LogOut, MapPin, Megaphone, MessageCircle, MessageSquare, Navigation, Pencil, Phone, Power, Search,
  ShieldCheck, Star, Timer, TrendingUp, Upload, User as UserIcon, Wallet, X, Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { browser } from "react-dom";
import {
  arrive, finishInspection, markComplete, placeBid, rateCustomer, resendCode, setOnline, startTravel, submitKycDoc, vendorAccept, vendorDecline, verifyStart, withdraw, withdrawBid,
} from "@/lib/demo/actions";
import { ACTIVE_STATUSES, COMMISSION_BPS, OTP_POLICY, RADIUS_KM, TIMING_LABELS } from "@/lib/demo/constants";
import { fmtCountdown, fmtDate, fmtPhone, statusPill, timeAgo, trade } from "@/lib/demo/format";
import { area, km } from "@/lib/demo/geo";
import { bidBreakdown, formatRand } from "@/lib/demo/money";
import { eligible } from "@/lib/demo/ops";
import { logout } from "@/lib/demo/session";
import { getService } from "@/lib/demo/services";
import { useStore } from "@/lib/demo/store";
import type { Bid, Gig, State, User, VerificationStatus } from "@/lib/demo/types";
import {
  Avatar, Badge, Button, Card, CodeDisplay, EmptyState, Field, FieldError, IconButton, Modal, Money, OtpInput, SectionTitle, Segmented,
  ServiceIcon, StarInput, Stars, StatTile, Switch, cx, toast, useTick,
} from "@/components/ui";
import { MapCard } from "@/components/map/MapCard";
import { AppBackButton, Redirect, navigate, useHashRoute } from "@/components/demo-app/router";
import { AppShell, PageHeader, RequireRole, type NavItem } from "@/components/demo-app/shell";
import { AdBanner, DemoModePanel, GigRow, GigTimeline, LockNote, MenuRow, PaymentBreakdown, PrivateBadge, Row } from "@/components/demo-app/parts";
import { MessagesPage, NotificationsPage } from "@/components/demo-app/social";
import { BrandMark, HomeHeader } from "@/components/demo-app/home-header";

/** Vendor tab bar, same pattern as the Figma customer tab bar. */
const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: House, match: (r) => r.path === "/" || r.path.startsWith("/opportunit") || r.path === "/notifications" },
  { to: "/gigs", label: "My Gigs", icon: Briefcase, match: (r) => r.path.startsWith("/gigs") || r.path.startsWith("/job/") },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/earnings", label: "Earnings", icon: Wallet },
  { to: "/profile", label: "Profile", icon: UserIcon, match: (r) => r.path === "/profile" || r.path === "/reviews" },
];

const isVerified = (u: User) => u.verification?.identity === "verified";

/** Pages that always render a back button (the rest only do with an id, e.g. `/job/:id`). */
const DETAIL_PAGES = new Set(["opportunities", "reviews", "notifications"]);

export default function VendorApp() {
  use(browser("The demo state lives in localStorage."));
  return <RequireRole role="vendor">{(u) => <Router user={u} />}</RequireRole>;
}

function Router({ user }: { user: User }) {
  const route = useHashRoute();
  const [a, b] = route.parts;
  let page;
  if (!a) page = <Dashboard user={user} />;
  else if (a === "opportunities") page = <Opportunities user={user} />;
  else if (a === "opportunity" && b) page = <OpportunityDetail key={b} user={user} gigId={b} />;
  else if (a === "job" && b) page = <JobDetail key={b} user={user} gigId={b} />;
  else if (a === "gigs") page = <MyJobs user={user} />;
  else if (a === "earnings") page = <Earnings user={user} />;
  else if (a === "reviews") page = <Reviews user={user} />;
  else if (a === "messages") page = <MessagesPage user={user} route={route} viewer="vendor" />;
  else if (a === "notifications") page = <NotificationsPage user={user} back="/" />;
  else if (a === "profile") page = <Profile user={user} />;
  else page = <EmptyState icon={Search} title="Page not found" action={<Button href="#/">Home</Button>} />;
  return (
    <AppShell app="vendor" nav={NAV} route={route} hideTabs={DETAIL_PAGES.has(a ?? "") || ((a === "opportunity" || a === "job" || a === "messages") && !!b)}>
      {page}
    </AppShell>
  );
}

function useVendorData(user: User) {
  const s = useStore();
  const opportunities = s.gigs
    .filter((g) => g.status === "bidding" && g.mode === "bid" && g.service === user.service && g.requestorId !== user.id)
    .filter((g) => km(user.area, g.area) <= RADIUS_KM)
    .sort((a, b) => b.createdAt - a.createdAt);
  const requests = s.gigs.filter((g) => g.vendorId === user.id && g.status === "vendor_selected");
  const jobs = s.gigs.filter((g) => g.vendorId === user.id && (ACTIVE_STATUSES.includes(g.status) || g.status === "payment_pending"));
  const myBids = s.bids.filter((b) => b.vendorId === user.id);
  return { s, opportunities, requests, jobs, myBids };
}

const userBy = (s: State, id?: string) => s.users.find((u) => u.id === id)!;

/* ================= Home ================= */
function Dashboard({ user }: { user: User }) {
  const { s, opportunities, requests, jobs } = useVendorData(user);
  return (
    <>
      <HomeHeader user={user} />
      <OnlineCard user={user} />
      {isVerified(user) ? (
        <div className="mb-6 mt-4 grid grid-cols-2 gap-3">
          <StatTile icon={Banknote} value={formatRand(user.lifetimeCents ?? 0)} label="Total earnings" />
          <StatTile icon={CircleCheck} value={user.completed} label="Completed gigs" />
        </div>
      ) : (
        <div className="mb-6"><VerificationBanner user={user} /></div>
      )}

      {requests.length > 0 && (
        <section className="mb-6">
          <SectionTitle>Instant requests</SectionTitle>
          <div className="space-y-2.5">{requests.map((g) => <InstantRequestCard key={g.id} gig={g} user={user} />)}</div>
        </section>
      )}
      {jobs.length > 0 && (
        <section className="mb-6">
          <SectionTitle action="See all" href="#/gigs">Active jobs</SectionTitle>
          <div className="space-y-2.5">
            {jobs.map((g) => (
              <GigRow key={g.id} gig={g} viewer="vendor" href={`#/job/${g.id}`} amountCents={g.agreedCents ?? g.hourlyRateCents ?? 0} hourly={g.mode === "instant"} sub={`${userBy(s, g.requestorId).short} · ${area(g.area).suburb}`} />
            ))}
          </div>
        </section>
      )}
      <section className="mb-6">
        <SectionTitle action="See all" href="#/opportunities">New opportunities</SectionTitle>
        <OpportunityList user={user} gigs={opportunities.slice(0, 5)} />
      </section>
      <AdBanner slot="provider_dashboard_bottom" />
    </>
  );
}

function OnlineCard({ user }: { user: User }) {
  return (
    <Card className={cx("flex items-center gap-3 p-4", user.online && "border-primary/40 bg-primary-soft")}>
      <span className={cx("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", user.online ? "bg-primary text-white" : "bg-field text-muted")}><Power size={19} /></span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[15px] font-bold text-ink">{user.online ? "You are online" : "You are offline"}</p>
        <p className="text-[13px] text-muted">{user.online ? "Receiving gigs nearby" : "Not receiving gigs"}</p>
      </div>
      <Switch
        on={!!user.online}
        label="Online"
        onChange={(v) => {
          setOnline(user.id, v);
          toast(v ? "You’re online" : "You’re offline");
        }}
      />
    </Card>
  );
}

function VerificationBanner({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const v = user.verification;
  const docs = v ? [v.identity, v.address, v.skills] : [];
  const started = docs.some((d) => d !== "unverified");
  const missing = docs.some((d) => d === "unverified" || d === "rejected");
  return (
    <div className="mt-3 rounded-2xl border border-gold/60 bg-yellow p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="shrink-0 text-[#8a5a00]" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{missing ? (started ? "Finish your verification" : "Verify your identity") : "Verification in review"}</p>
          <p className="text-[13px] text-ink/70">
            {missing ? "Upload your KYC documents to start receiving gigs." : "Your documents are with the NEXO® trust team."} (Demo: sign in as Admin to approve.)
          </p>
        </div>
      </div>
      <Button full size="sm" icon={Upload} className="mt-3" variant={missing ? "primary" : "secondary"} onClick={() => setOpen(true)}>
        {!started ? "Begin KYC" : missing ? "Upload KYC" : "View KYC status"}
      </Button>
      {open && <KycSheet user={user} onClose={() => setOpen(false)} />}
    </div>
  );
}

function KycSheet({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="KYC documents">
      <p className="-mt-3 mb-4 text-[13.5px] text-muted">Upload each document once. They’re stored privately and reviewed by the NEXO® trust team.</p>
      <div className="space-y-2.5">
        {VERIFY_ROWS.map((row) => {
          const I = row.icon;
          const st = user.verification?.[row.key] ?? "unverified";
          const canUpload = st === "unverified" || st === "rejected";
          return (
            <Card key={row.key} className="flex items-center gap-3 p-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><I size={18} /></span>
              <span className="min-w-0 flex-1 text-[15px] font-medium">{row.label}</span>
              {canUpload ? (
                <Button size="sm" icon={Upload} onClick={() => { submitKycDoc(user.id, row.key); toast(`${row.label} uploaded`); }}>Upload</Button>
              ) : (
                <Badge tone={verifyTone(st)}>{st === "pending" ? "in review" : st}</Badge>
              )}
            </Card>
          );
        })}
      </div>
      <Button full size="lg" variant="secondary" className="mt-5" onClick={onClose}>Done</Button>
    </Modal>
  );
}

function OpportunityList({ user, gigs }: { user: User; gigs: Gig[] }) {
  const s = useStore();
  if (gigs.length === 0)
    return <EmptyState icon={Search} title="No open gigs right now" body={user.online ? "New gigs within 30 km will appear here instantly." : "Go online to receive gigs."} />;
  return (
    <div className="space-y-2.5">
      {gigs.map((g) => {
        const mine = s.bids.find((b) => b.gigId === g.id && b.vendorId === user.id && b.status === "pending");
        return (
          <Card key={g.id} href={`#/opportunity/${g.id}`} className="p-3.5">
            <div className="flex items-center gap-3">
              <ServiceIcon slug={g.service} tile={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-ink">{g.title}</p>
                <p className="flex items-center gap-1 truncate text-[13px] text-muted"><MapPin size={13} className="shrink-0" />{area(g.area).suburb} · {km(user.area, g.area)} km · {timeAgo(g.createdAt)}</p>
              </div>
              <div className="shrink-0 text-right">
                <Money cents={g.budgetCents ?? 0} className="text-[16px]" />
                <div className="mt-1">{mine ? <Badge>Bid sent</Badge> : <Badge tone="gray">Bid</Badge>}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function InstantRequestCard({ gig, user }: { gig: Gig; user: User }) {
  const s = useStore();
  const r = userBy(s, gig.requestorId);
  return (
    <Card className="border-gold/70 p-4">
      <div className="flex items-start gap-3">
        <ServiceIcon slug={gig.service} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-bold">{gig.title}</p>
            <Badge tone="gold" icon={Zap}>Instant</Badge>
          </div>
          <p className="text-[13px] text-muted">{r.short} · {area(gig.area).suburb} · {km(user.area, gig.area)} km · {TIMING_LABELS[gig.timing]}</p>
          <p className="mt-1.5 text-[13.5px] text-ink/80">{gig.description}</p>
        </div>
        <Money cents={gig.hourlyRateCents ?? 0} hourly className="text-[15px]" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button onClick={() => { vendorAccept(gig.id); toast("Accepted. Waiting for payment."); navigate(`/job/${gig.id}`); }}>Accept</Button>
        <Button variant="secondary" onClick={() => { vendorDecline(gig.id); toast("Request declined"); }}>Decline</Button>
      </div>
    </Card>
  );
}

/* ================= Gigs (opportunities) ================= */
function Opportunities({ user }: { user: User }) {
  const { opportunities } = useVendorData(user);
  return (
    <>
      <PageHeader title="New opportunities" sub={`${getService(user.service)?.name} gigs within 30 km of ${area(user.area).suburb}`} back="/" />
      <OpportunityList user={user} gigs={opportunities} />
      <div className="mt-4"><LockNote>Exact addresses are hidden until you are booked. You see the suburb and your distance only.</LockNote></div>
    </>
  );
}

function OpportunityDetail({ user, gigId }: { user: User; gigId: string }) {
  const s = useStore();
  const [bidding, setBidding] = useState(false);
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig) return <EmptyState icon={Search} title="Opportunity not found" action={<Button href="#/opportunities">Back to gigs</Button>} />;
  if (gig.vendorId === user.id && gig.status !== "bidding") return <Redirect to={`/job/${gig.id}`} />;
  const existing = s.bids.find((b) => b.gigId === gigId && b.vendorId === user.id && b.status !== "withdrawn");
  const pending = existing?.status === "pending" ? existing : undefined;
  const r = userBy(s, gig.requestorId);
  const dist = km(user.area, gig.area);
  const open = gig.status === "bidding";
  const canBid = open && eligible(s, user, gig);
  const blocked = !open
    ? `This gig is no longer taking bids${existing?.status === "rejected" ? ". The requestor chose another vendor." : "."}`
    : !canBid
      ? user.online ? (isVerified(user) ? "This gig is outside your area or service." : "Complete verification to bid.") : "Go online to bid on gigs."
      : null;
  return (
    <>
      <PageHeader title="Gig Details" sub={`Posted by ${r.short} · ${timeAgo(gig.createdAt)}`} back="/opportunities" />
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <ServiceIcon slug={gig.service} tile={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-bold leading-snug text-ink">{gig.title}</p>
              <p className="text-[13px] text-muted">{getService(gig.service)?.name} · {gig.ref}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="gold" icon={Gavel}>Bid flow</Badge>
            <Badge tone="gray">{TIMING_LABELS[gig.timing]}</Badge>
          </div>
          <div className="mt-3 border-t border-line pt-2">
            <Row k="Budget (total)" v={formatRand(gig.budgetCents ?? 0)} strong />
            <Row k="Area" v={`${area(gig.area).suburb}, ${area(gig.area).city}`} />
            <Row k="Distance" v={`${dist} km`} />
            <div className="flex items-center justify-between py-1.5"><span className="text-sm text-ink/80">Address</span><PrivateBadge /></div>
          </div>
          <p className="mt-3 border-t border-line pt-3 text-[13px] font-semibold text-muted">Work description</p>
          <p className="text-[14.5px] text-ink/85">{gig.description}</p>
          {gig.photos > 0 && (
            <div className="mt-3 flex gap-2">
              {Array.from({ length: gig.photos }).map((_, i) => <span key={i} className="flex size-16 items-center justify-center rounded-xl bg-primary-soft text-ink/60"><Camera size={18} /></span>)}
            </div>
          )}
        </Card>
        {pending && (
          <Card className="border-primary/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-muted">Your bid</p>
                <Money cents={pending.amountCents} className="block text-[28px]" />
              </div>
              <Badge>Bid sent</Badge>
            </div>
            <div className="mt-2 border-t border-line pt-2">
              <Row k="Estimated arrival" v={pending.etaMinutes < 60 ? `${pending.etaMinutes} min` : `${pending.etaMinutes / 60} hr`} />
              <Row k={`You receive (after ${COMMISSION_BPS / 100}%)`} v={formatRand(bidBreakdown(pending.amountCents).vendorPayoutCents)} />
              <Row k="Sent" v={timeAgo(pending.createdAt)} />
            </div>
            {pending.note && <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[13.5px] text-ink/80">“{pending.note}”</p>}
            <p className="mt-3 flex items-center gap-2 text-sm text-muted"><LoaderCircle size={15} className="animate-spin text-primary" /> Waiting for {r.short} to choose…</p>
          </Card>
        )}
        {blocked && <Card className="p-4 text-sm text-muted">{blocked}</Card>}
        <MapCard center={gig.area} spanKm={Math.max(10, dist * 1.4)} height="h-44" markers={[{ area: gig.area, kind: "destination", label: "Approximate area" }, { area: user.area, kind: "you" }]} caption="Approximate area, exact address after booking" />
        <DemoModePanel gig={gig} viewer="vendor" />
      </div>
      {canBid && (
        <div className="sticky bottom-0 -mx-5 mt-5 bg-gradient-to-t from-cream via-cream to-cream/0 px-5 pb-3 pt-4">
          {pending ? (
            <div className="grid grid-cols-2 gap-2">
              <Button size="lg" variant="secondary" onClick={() => { withdrawBid(pending.id); toast("Bid withdrawn"); }}>Withdraw Bid</Button>
              <Button size="lg" icon={Pencil} onClick={() => setBidding(true)}>Update Bid</Button>
            </div>
          ) : (
            <Button full size="lg" icon={Gavel} onClick={() => setBidding(true)}>Place a Bid</Button>
          )}
        </div>
      )}
      {bidding && <BidSheet user={user} gig={gig} existing={pending} onClose={() => setBidding(false)} />}
    </>
  );
}

function BidSheet({ user, gig, existing, onClose }: { user: User; gig: Gig; existing?: Bid; onClose: () => void }) {
  const budget = gig.budgetCents ?? 0;
  const [amount, setAmount] = useState(() => String(((existing?.amountCents ?? budget) / 100) | 0));
  const [eta, setEta] = useState(existing?.etaMinutes ?? 30);
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState<string>();
  const cents = Number(amount.replace(/\D/g, "")) * 100;
  const payout = cents ? bidBreakdown(cents).vendorPayoutCents : 0;
  const chips = [Math.round((budget * 0.9) / 1000) * 10, Math.round(budget / 100), Math.round((budget * 1.1) / 1000) * 10];
  const submit = () => {
    if (!cents) return setError("Enter your bid amount");
    if (cents > 10_000_000) return setError("Bid must be under R100,000");
    placeBid(user.id, gig.id, cents, eta, note.trim() || undefined);
    toast(existing ? "Bid updated" : "Bid sent. The requestor is notified.");
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={existing ? "Update your bid" : "Place a bid"}>
      <p className="-mt-3 mb-4 text-[13.5px] text-muted">{gig.title} · budget {formatRand(budget)}</p>
      <div className="space-y-4">
        <Field label="Bid amount" error={error} htmlFor="amt">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-ink/70">R</span>
            <input id="amt" inputMode="numeric" className="field pl-8 text-lg font-semibold" value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setError(undefined); }} />
          </div>
        </Field>
        <div className="grid grid-cols-3 gap-2">
          {chips.map((x, i) => (
            <button key={i} type="button" onClick={() => { setAmount(String(x)); setError(undefined); }} className={cx("h-10 rounded-full border text-sm font-semibold transition", Number(amount) === x ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary/40")}>
              {formatRand(x * 100)}
            </button>
          ))}
        </div>
        <Field label="Estimated arrival" htmlFor="eta">
          <select id="eta" className="field" value={eta} onChange={(e) => setEta(Number(e.target.value))}>
            {[15, 30, 45, 60, 90, 120].map((x) => <option key={x} value={x}>{x < 60 ? `${x} min` : `${x / 60} hr`}</option>)}
          </select>
        </Field>
        <Field label="Note (optional)" htmlFor="nt">
          <textarea id="nt" rows={2} className="field resize-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. I carry the parts needed" />
        </Field>
        {!!payout && <p className="rounded-xl bg-primary-soft px-3 py-2 text-[13.5px] text-primary-dark">You’ll receive <b>{formatRand(payout)}</b> after the {COMMISSION_BPS / 100}% commission.</p>}
        <Button full size="lg" icon={Gavel} onClick={submit}>{existing ? "Save new bid" : "Submit bid"}</Button>
      </div>
    </Modal>
  );
}

/* ================= Job detail ================= */
const STARTED = ["active", "completion_verification", "completed", "cancelled"];

function JobDetail({ user, gigId }: { user: User; gigId: string }) {
  const s = useStore();
  useTick(1000);
  const gig = s.gigs.find((g) => g.id === gigId && g.vendorId === user.id);
  if (!gig)
    return s.gigs.find((g) => g.id === gigId && g.status === "bidding") ? (
      <Redirect to={`/opportunity/${gigId}`} />
    ) : (
      <EmptyState icon={Search} title="Job not found" action={<Button href="#/gigs">My Gigs</Button>} />
    );
  const r = userBy(s, gig.requestorId);
  const pill = statusPill(gig, "vendor");
  const started = STARTED.includes(gig.status);
  // Once you head out, the map and actions take focus; the details fold away.
  const collapsed = started || gig.status === "traveling" || gig.status === "start_verification";
  const released = !!gig.addressReleasedAt && !["vendor_selected", "payment_pending", "bidding"].includes(gig.status);
  const cta =
    gig.status === "accepted" ? (
      <Button full size="lg" icon={Navigation} onClick={() => { startTravel(gig.id); toast(`${r.short} can see you’re on the way`); }}>Start travelling</Button>
    ) : gig.status === "traveling" ? (
      <Button full size="lg" icon={MapPin} onClick={() => { arrive(gig.id); toast("Start code sent to the requestor"); }}>I’ve arrived</Button>
    ) : null;
  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <AppBackButton fallback="/gigs" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[22px] font-bold leading-tight text-ink">Gig Details</h1>
          <p className={cx("truncate text-[13px] font-semibold", started ? "text-muted" : "text-primary")}>{pill.text}</p>
        </div>
      </div>
      <div className="space-y-4">
        <JobDetailsCard key={String(collapsed)} gig={gig} released={released} collapsed={collapsed} />
        {gig.status !== "cancelled" && <RequesterCard r={r} gig={gig} />}
        {!started && <DestinationCard gig={gig} user={user} released={released} />}
        <JobPanel gig={gig} r={r} />
        {gig.status === "accepted" && gig.mode === "bid" && <BidAcceptedModal gig={gig} r={r} />}
        {(ACTIVE_STATUSES.includes(gig.status) || gig.status === "completed") && <Card className="p-4"><GigTimeline gig={gig} viewer="vendor" /></Card>}
        <DemoModePanel gig={gig} viewer="vendor" />
      </div>
      {cta && <div className="sticky bottom-0 -mx-5 mt-5 bg-gradient-to-t from-cream via-cream to-cream/0 px-5 pb-3 pt-4">{cta}</div>}
    </>
  );
}

/** Pops up once when the requestor accepts your bid; closing it leaves the job page as is. */
function BidAcceptedModal({ gig, r }: { gig: Gig; r: User }) {
  const key = `nexo.bidAcceptedSeen.${gig.id}`;
  const [open, setOpen] = useState(() => !sessionStorage.getItem(key));
  const close = () => {
    sessionStorage.setItem(key, "1");
    setOpen(false);
  };
  const earn = gig.agreedCents ? bidBreakdown(gig.agreedCents).vendorPayoutCents : 0;
  return (
    <Modal open={open} onClose={close} title="Bid accepted">
      <div className="text-center">
        <span className="mx-auto flex size-16 animate-pop items-center justify-center rounded-full bg-primary text-white"><CircleCheck size={32} strokeWidth={2.6} /></span>
        <p className="mt-4 font-display text-[22px] font-bold">{r.short} accepted your bid!</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Payment is protected until completion. Head over when you’re ready.</p>
        <div className="mx-auto mt-4 max-w-xs rounded-xl bg-white p-3 text-left">
          <Row k={`You’ll earn (after ${COMMISSION_BPS / 100}%)`} v={formatRand(earn)} strong />
        </div>
        <Button full size="lg" className="mt-5" onClick={close}>Got it</Button>
      </div>
    </Modal>
  );
}

/** Pops up once when the completion is verified and the payout lands in the wallet. */
function PaidModal({ gig }: { gig: Gig }) {
  const key = `nexo.paidSeen.${gig.id}`;
  // Only for a fresh payout; older completed gigs just show the summary.
  const [open, setOpen] = useState(() => !sessionStorage.getItem(key) && Date.now() - (gig.completedAt ?? 0) < 30 * 60_000);
  const close = () => {
    sessionStorage.setItem(key, "1");
    setOpen(false);
  };
  return (
    <Modal open={open} onClose={close} title="Payment released">
      <div className="text-center">
        <span className="mx-auto flex size-16 animate-pop items-center justify-center rounded-full bg-primary-soft text-primary"><Wallet size={30} /></span>
        <Money cents={gig.settlement?.payoutCents ?? 0} className="mt-3 block text-[34px]" />
        <p className="text-sm text-muted">Paid to your wallet for {gig.title}</p>
        <Button full size="lg" className="mt-5" onClick={close}>Got it</Button>
      </div>
    </Modal>
  );
}

function JobDetailsCard({ gig, released, collapsed }: { gig: Gig; released: boolean; collapsed: boolean }) {
  const [open, setOpen] = useState(!collapsed);
  const earn = gig.mode === "bid" && gig.agreedCents ? bidBreakdown(gig.agreedCents).vendorPayoutCents : null;
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
          {gig.mode === "bid" ? <Row k="Agreed bid" v={formatRand(gig.agreedCents ?? 0)} /> : <Row k="Hourly rate" v={`${formatRand(gig.hourlyRateCents ?? 0)}/hr`} />}
          {earn != null && <Row k={`You’ll earn (after ${COMMISSION_BPS / 100}%)`} v={formatRand(earn)} strong />}
          <Row k="When" v={TIMING_LABELS[gig.timing]} />
          {released ? <Row k="Address" v={gig.address} /> : <Row k="Area" v={`${area(gig.area).suburb}, ${area(gig.area).city}`} />}
          <p className="mt-2 border-t border-line pt-2 text-[13px] font-semibold text-muted">Work description</p>
          <p className="text-[14px] text-ink/85">{gig.description}</p>
          {gig.photos > 0 && (
            <div className="mt-3 flex gap-2">
              {Array.from({ length: gig.photos }).map((_, i) => <span key={i} className="flex size-14 items-center justify-center rounded-xl bg-primary-soft text-ink/60"><Camera size={17} /></span>)}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function RequesterCard({ r, gig }: { r: User; gig: Gig }) {
  const canMessage = !["vendor_selected", "bidding", "cancelled"].includes(gig.status);
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <Avatar name={r.name} id={r.id} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-ink">{r.short}</p>
        <p className="truncate text-[13px] text-muted">Service Requestor</p>
      </div>
      {canMessage && (
        <>
          <IconButton icon={Phone} label={`Call ${r.short}`} onClick={() => toast("Calls are masked in production. Demo only.")} />
          <IconButton icon={MessageCircle} label={`Message ${r.short}`} href={`#/messages/${gig.id}`} />
        </>
      )}
    </Card>
  );
}

/** Map and destination in one place: prominent until the work starts. */
function DestinationCard({ gig, user, released }: { gig: Gig; user: User; released: boolean }) {
  const dist = km(user.area, gig.area);
  const traveling = gig.status === "traveling";
  return (
    <Card className="overflow-hidden p-0">
      <MapCard
        center={gig.area}
        spanKm={traveling ? 12 : Math.max(10, dist * 1.4)}
        height="h-52"
        className="rounded-none! border-0!"
        markers={[{ area: gig.area, kind: "destination" }, { area: user.area, kind: "you" }]}
        route={traveling || gig.status === "accepted" ? { from: user.area, to: gig.area } : undefined}
        progress={traveling ? 0.5 : undefined}
        caption={traveling ? "Navigation" : released ? undefined : "Approximate area, exact address after payment"}
      />
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[16px] font-bold">Destination</p>
          <span className="text-[13px] font-semibold text-primary">{dist} km{traveling && gig.etaMinutes ? ` · about ${gig.etaMinutes} min` : ""}</span>
        </div>
        {released ? (
          <>
            <p className="mt-2 flex items-start gap-2 text-[15px] font-semibold"><MapPin size={17} className="mt-0.5 shrink-0 text-primary" />{gig.address}</p>
            <Button size="sm" variant="secondary" icon={Navigation} className="mt-3" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gig.address)}`} target="_blank">Open in Maps</Button>
            <p className="mt-3 text-xs text-muted">{traveling ? "Tap “I’ve arrived” at the door and the requestor receives a start code." : "Released to you only, because you are the assigned vendor."}</p>
          </>
        ) : (
          <div className="mt-2"><LockNote>{`${area(gig.area).suburb}, ${area(gig.area).city}. The exact address is released once the requestor pays.`}</LockNote></div>
        )}
      </div>
    </Card>
  );
}

function JobPanel({ gig, r }: { gig: Gig; r: User }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const now = useTick(1000);
  const [hours, setHours] = useState(() => Math.max(1, Math.round(((Date.now() - (gig.startedAt ?? Date.now())) / 3_600_000) * 4) / 4) || 1);
  switch (gig.status) {
    case "vendor_selected":
      return (
        <Card className="p-4">
          <p className="text-[17px] font-bold">New instant request</p>
          <p className="mt-1 text-sm text-muted">{r.short} wants to book you at {formatRand(gig.hourlyRateCents ?? 0)}/hr. The first hour is paid when you accept and they confirm.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={() => { vendorAccept(gig.id); toast("Accepted. Waiting for payment."); }}>Accept</Button>
            <Button variant="secondary" onClick={() => { vendorDecline(gig.id); toast("Request declined"); navigate("/"); }}>Decline</Button>
          </div>
        </Card>
      );
    case "payment_pending":
      return (
        <Card className="flex flex-col items-center px-5 py-8 text-center">
          <LoaderCircle className="mb-3 animate-spin text-primary" size={30} />
          <p className="text-[17px] font-bold">Waiting for {r.short} to pay</p>
          <p className="mt-1 text-sm text-muted">You’ll get the exact address as soon as payment is confirmed.</p>
        </Card>
      );
    case "accepted":
    case "traveling":
      return null;
    case "start_verification":
      return (
        <Card className="p-5 text-center">
          <Badge icon={MapPin}>Arrived</Badge>
          <p className="mt-3 font-display text-xl font-bold">Enter the start code</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Ask {r.short} for the 6-digit code on their phone. It confirms the gig has started.</p>
          <div className="my-5"><OtpInput value={code} onChange={(c) => { setCode(c); setError(undefined); }} invalid={!!error} /></div>
          {error && <div className="flex justify-center"><FieldError>{error}</FieldError></div>}
          <Button
            size="lg"
            full
            className="mt-3"
            disabled={code.length !== 6}
            icon={ShieldCheck}
            onClick={() => {
              const res = verifyStart(gig.id, code);
              if (res.ok) toast("Verified. You can begin.");
              else {
                setError(res.error);
                setCode("");
              }
            }}
          >
            Verify start
          </Button>
          <p className="mt-3 text-xs text-muted">{gig.startOtp ? `Code expires in ${fmtCountdown(gig.startOtp.expiresAt - now)} · ${OTP_POLICY.maxAttempts - gig.startOtp.attempts} attempts left` : ""}</p>
        </Card>
      );
    case "active":
      return (
        <Card className="p-4">
          <Badge icon={Timer}>{gig.stage === "inspection" ? "Inspecting the job" : "Work in progress"}</Badge>
          <p className="mb-4 mt-2 text-sm text-muted">{gig.stage === "inspection" ? "Check the job on site, then start the work." : `Mark the gig complete when you’re done and give ${r.short} the completion code.`}</p>
          {gig.stage === "inspection" ? (
            <Button full size="lg" icon={CircleCheck} onClick={() => finishInspection(gig.id)}>Inspection done, start the gig</Button>
          ) : (
            <div className="space-y-3">
              {gig.mode === "instant" && (
                <Field label="Time on site" hint="Billed per 15 minutes, minimum 1 hour. The first hour is already paid." htmlFor="hrs">
                  <select id="hrs" className="field" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                    {[1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 8].map((h) => (
                      <option key={h} value={h}>{h} hour{h === 1 ? "" : "s"}: {formatRand(Math.round((gig.hourlyRateCents ?? 0) * h))}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Button full size="lg" icon={CircleCheck} onClick={() => { markComplete(gig.id, gig.mode === "instant" ? Math.round(hours * 60) : undefined); toast("Completion code generated"); }}>Mark Gig Completed</Button>
            </div>
          )}
        </Card>
      );
    case "completion_verification":
      return (
        <Card className="p-5 text-center">
          <Badge tone="gold" icon={CircleCheck}>Marked complete</Badge>
          <p className="mt-3 font-display text-xl font-bold">Give {r.short} this completion code</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Once they’re happy with the work they enter it on their phone. That releases your payment.</p>
          {gig.completionOtp && <div className="my-5"><CodeDisplay code={gig.completionOtp.code} /></div>}
          {gig.completionOtp && <p className="inline-flex items-center gap-1 text-sm text-muted"><Timer size={14} />Expires in {fmtCountdown(gig.completionOtp.expiresAt - now)}</p>}
          <Button full variant="ghost" className="mt-2" onClick={() => { const res = resendCode(gig.id, "completion"); toast(res.ok ? "New completion code issued" : res.error); }}>Issue a new code</Button>
        </Card>
      );
    case "completed":
      return (
        <>
          <PaidModal gig={gig} />
          <Card className="p-4">
            <p className="mb-1 text-[16px] font-bold">Payment summary</p>
            <PaymentBreakdown gig={gig} viewer="vendor" />
          </Card>
          <Card className="p-4">
            <p className="mb-2 text-[16px] font-bold">Review from {r.short}</p>
            {gig.review ? (
              <>
                <StarInput value={gig.review.rating} size={18} />
                <p className="mt-2 text-sm text-ink/80">&quot;{gig.review.text}&quot;</p>
              </>
            ) : (
              <p className="text-sm text-muted">Waiting for their review.</p>
            )}
          </Card>
          <RateCustomerCard gig={gig} r={r} />
        </>
      );
    case "cancelled":
      return <EmptyState icon={X} title="This gig was cancelled" />;
    default:
      return null;
  }
}

/** Vendors rate the requestor too. Same pattern as the requestor's "Rate vendor" card and sheet. */
function RateCustomerCard({ gig, r }: { gig: Gig; r: User }) {
  const [open, setOpen] = useState(false);
  if (gig.customerReview) {
    return (
      <Card className="p-5 text-center">
        <p className="text-[15px] font-bold">Your rating</p>
        <div className="my-3 flex justify-center"><StarInput value={gig.customerReview.rating} size={28} /></div>
        {gig.customerReview.text && <p className="text-sm text-ink/80">&quot;{gig.customerReview.text}&quot;</p>}
      </Card>
    );
  }
  return (
    <>
      <Card className="flex items-center gap-3 p-4">
        <Star size={20} className="shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-[14px] font-semibold text-ink">How was {r.short}?</p>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>Rate</Button>
      </Card>
      {open && <RateCustomerSheet gig={gig} r={r} onClose={() => setOpen(false)} />}
    </>
  );
}

function RateCustomerSheet({ gig, r, onClose }: { gig: Gig; r: User; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  return (
    <Modal open onClose={onClose} title={`Rate ${r.short}`}>
      <div className="-mt-2 mb-4 flex items-center gap-3">
        <Avatar name={r.name} id={r.id} size={44} />
        <p className="min-w-0 text-[13.5px] text-muted">{gig.title} · {gig.ref}</p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-center"><StarInput value={rating} onChange={setRating} /></div>
        <Field label="Written review (optional)" htmlFor="crv">
          <textarea id="crv" rows={3} className="field resize-none" value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience with this customer..." />
        </Field>
        <Button full size="lg" disabled={!rating} onClick={() => { rateCustomer(gig.id, rating, text.trim()); toast("Thanks, review submitted"); }}>Submit review</Button>
      </div>
    </Modal>
  );
}

/* ================= My jobs ================= */
function MyJobs({ user }: { user: User }) {
  const s = useStore();
  const [tab, setTab] = useState<"active" | "bids" | "completed">("active");
  const mine = s.gigs.filter((g) => g.vendorId === user.id);
  const bids = s.bids
    .filter((b) => b.vendorId === user.id && b.status === "pending")
    .map((b) => ({ b, g: s.gigs.find((g) => g.id === b.gigId) }))
    .filter((x): x is { b: typeof x.b; g: Gig } => !!x.g);
  const active = mine.filter((g) => ACTIVE_STATUSES.includes(g.status) || g.status === "payment_pending" || g.status === "vendor_selected");
  const done = mine.filter((g) => g.status === "completed");
  return (
    <>
      <BrandMark />
      <PageHeader title="My Gigs" sub="Jobs, bids and history." />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatTile icon={Briefcase} value={active.length} label="Active jobs" />
        <StatTile icon={CircleCheck} value={done.length} label="Completed" />
      </div>
      <Segmented className="mb-4" value={tab} onChange={setTab} options={[{ value: "active", label: `Active (${active.length})` }, { value: "bids", label: `Bids (${bids.length})` }, { value: "completed", label: `Done (${done.length})` }]} />
      <div className="space-y-2.5">
        {tab === "active" &&
          (active.length ? (
            active.map((g) => <GigRow key={g.id} gig={g} viewer="vendor" href={`#/job/${g.id}`} amountCents={g.agreedCents ?? g.hourlyRateCents ?? 0} hourly={g.mode === "instant"} sub={`${userBy(s, g.requestorId)?.short} · ${area(g.area).suburb}`} />)
          ) : (
            <EmptyState icon={Briefcase} title="No active jobs" body="Win a bid or accept an instant request to start." action={<Button href="#/opportunities">Find gigs</Button>} />
          ))}
        {tab === "bids" &&
          (bids.length ? (
            bids.map(({ b, g }) => <GigRow key={b.id} gig={g} viewer="vendor" href={`#/opportunity/${g.id}`} amountCents={b.amountCents} sub={`Your bid · ETA ${b.etaMinutes} min · ${timeAgo(b.createdAt)}`} />)
          ) : (
            <EmptyState icon={Gavel} title="No pending bids" />
          ))}
        {tab === "completed" &&
          (done.length ? (
            done.map((g) => <GigRow key={g.id} gig={g} viewer="vendor" href={`#/job/${g.id}`} amountCents={g.settlement?.payoutCents ?? 0} sub={`${userBy(s, g.requestorId)?.short} · ${g.completedAt ? fmtDate(g.completedAt) : ""}`} />)
          ) : (
            <EmptyState icon={CircleCheck} title="No completed gigs yet" />
          ))}
      </div>
    </>
  );
}

/* ================= Earnings ================= */
function Earnings({ user }: { user: User }) {
  const s = useStore();
  const payouts = s.payouts.filter((p) => p.vendorId === user.id);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const month = payouts.filter((p) => p.at >= monthStart && p.netCents > 0);
  return (
    <>
      <PageHeader title="Earnings" sub="Payouts land in your wallet when completion is verified." />
      <div className="mb-4 rounded-2xl bg-ink p-5 text-white">
        <p className="text-[13px] font-medium text-white/75">Available balance</p>
        <p className="mt-1 font-display text-[34px] font-bold">{formatRand(user.walletCents ?? 0)}</p>
        <button
          type="button"
          disabled={!user.walletCents}
          onClick={() => { withdraw(user.id); toast("Withdrawal requested"); }}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-ink transition hover:bg-cream disabled:opacity-50"
        >
          <Wallet size={18} /> Withdraw to FNB •• 8821
        </button>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatTile icon={Banknote} value={formatRand(month.reduce((n, p) => n + p.netCents, 0))} label="This month" />
        <StatTile icon={Star} value={user.rating ? user.rating.toFixed(1) : "New"} label="Rating" />
        <StatTile icon={CircleCheck} value={month.length} label="Paid gigs this month" />
        <StatTile icon={TrendingUp} value={`${COMMISSION_BPS / 100}%`} label="NEXO® commission" />
      </div>
      <SectionTitle>Recent payouts</SectionTitle>
      {payouts.length === 0 ? (
        <EmptyState icon={Wallet} title="No payouts yet" />
      ) : (
        <div className="space-y-2.5">
          {payouts.map((p) => (
            <Card key={p.id} className="flex items-center gap-3 p-3.5">
              <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-xl", p.netCents > 0 ? "bg-primary-soft text-primary" : "bg-field text-muted")}><Wallet size={18} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{p.title}</p>
                <p className="text-xs text-muted">
                  {fmtDate(p.at)}
                  {p.commissionCents ? ` · gross ${formatRand(p.grossCents)} · fee ${formatRand(p.commissionCents)}` : ""}
                  {p.status === "processing" ? " · processing" : ""}
                </p>
              </div>
              <span className={cx("font-display font-bold tabular-nums", p.netCents > 0 ? "text-primary" : "text-muted")}>
                {p.netCents > 0 ? "+" : "-"}{formatRand(Math.abs(p.netCents))}
              </span>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ================= Reviews ================= */
function Reviews({ user }: { user: User }) {
  const s = useStore();
  const reviewed = s.gigs.filter((g) => g.vendorId === user.id && g.review).sort((a, b) => b.review!.at - a.review!.at);
  return (
    <>
      <PageHeader title="Reviews" sub={`${user.rating ? user.rating.toFixed(1) : "New"} average from ${user.reviewCount} reviews`} back="/profile" />
      {reviewed.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" body="Reviews appear after verified completion." />
      ) : (
        <div className="space-y-2.5">
          {reviewed.map((g) => {
            const r = userBy(s, g.requestorId);
            return (
              <Card key={g.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={r.name} id={r.id} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold">{r.short}</p>
                    <p className="truncate text-xs text-muted">{g.title} · {timeAgo(g.review!.at)}</p>
                  </div>
                  <StarInput value={g.review!.rating} size={14} />
                </div>
                <p className="mt-2.5 text-[14px] text-ink/85">{g.review!.text}</p>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ================= Profile & verification ================= */
const VERIFY_ROWS = [
  { key: "identity", label: "Identity (SA ID)", icon: BadgeCheck },
  { key: "address", label: "Proof of address", icon: House },
  { key: "skills", label: "Skills & certificates", icon: FileText },
] as const;
const verifyTone = (v: VerificationStatus) => (v === "verified" ? "green" : v === "pending" ? "gold" : v === "rejected" ? "red" : "gray");

function ProfileKycButton({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const missing = Object.values(user.verification ?? {}).some((d) => d === "unverified" || d === "rejected");
  return (
    <>
      <Button full size="sm" icon={Upload} variant={missing ? "primary" : "secondary"} className="mt-3" onClick={() => setOpen(true)}>{missing ? "Upload KYC" : "View KYC status"}</Button>
      {open && <KycSheet user={user} onClose={() => setOpen(false)} />}
    </>
  );
}

function Profile({ user }: { user: User }) {
  const s = useStore();
  const router = useRouter();
  const ad = s.ads.find((a) => a.slot === "provider_dashboard_bottom");
  const reviews = s.gigs.filter((g) => g.vendorId === user.id && g.review).sort((a, b) => b.review!.at - a.review!.at);
  return (
    <>
      <PageHeader title="Profile" />
      <Card className="mb-4 flex items-center gap-4 p-4">
        <Avatar name={user.name} id={user.id} size={72} letter={user.name[0]} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-display text-[20px] font-bold leading-tight text-ink"><span className="truncate">{user.name}</span> {isVerified(user) && <BadgeCheck size={18} className="shrink-0 text-primary" />}</p>
          <p className="truncate text-[14px] text-muted">{trade(user.service)} · {area(user.area).suburb}</p>
          <div className="mt-1"><Stars value={user.rating} count={user.reviewCount} /></div>
        </div>
        <IconButton icon={Pencil} label="Edit profile" onClick={() => toast("Profile editing launches with the live backend")} />
      </Card>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <StatTile icon={Banknote} value={<>{formatRand(user.rateCents ?? 0)}<span className="text-[15px] font-semibold text-muted">/hr</span></>} label="Hourly rate" />
        <StatTile icon={CircleCheck} value={user.completed} label="Completed gigs" />
      </div>
      <Card className="mb-4 divide-y divide-line overflow-hidden">
        <MenuRow icon={Phone} label="Phone number" value={fmtPhone(user.phone)} />
        <MenuRow icon={UserIcon} label="Account type" value="Vendor" />
        <MenuRow icon={MapPin} label="Service radius" value="30 km" />
      </Card>
      <section className="mb-4">
        <SectionTitle action={reviews.length ? "See all" : undefined} href={reviews.length ? "#/reviews" : undefined}>Reviews</SectionTitle>
        {reviews.length === 0 ? (
          <Card className="p-4 text-sm text-muted">Reviews from completed gigs appear here.</Card>
        ) : (
          <div className="space-y-2.5">
            {reviews.slice(0, 2).map((g) => (
              <Card key={g.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[14px] font-bold text-ink"><Avatar name={userBy(s, g.requestorId).name} id={g.requestorId} size={28} />{userBy(s, g.requestorId).short}</span>
                  <StarInput value={g.review!.rating} size={14} />
                </div>
                <p className="mt-1.5 text-[13.5px] text-ink/80">{g.review!.text}</p>
                <p className="text-xs text-muted">{g.title} · {timeAgo(g.review!.at)}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
      <Card className="mb-3 p-4">
        <p className="mb-3 text-[16px] font-bold">Verification</p>
        <div className="space-y-3">
          {VERIFY_ROWS.map((row) => {
            const I = row.icon;
            const st = user.verification?.[row.key] ?? "unverified";
            return (
              <div key={row.key} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary"><I size={18} /></span>
                <span className="flex-1 text-[15px] font-medium">{row.label}</span>
                <Badge tone={verifyTone(st)}>{st}</Badge>
              </div>
            );
          })}
        </div>
        {!!user.certifications?.length && <div className="mt-4 flex flex-wrap gap-2">{user.certifications.map((c) => <Badge key={c} icon={ShieldCheck}>{c}</Badge>)}</div>}
        <p className="mt-4 text-xs text-muted">Documents are stored privately and reviewed by the NEXO® trust team.</p>
        {!isVerified(user) && <ProfileKycButton user={user} />}
      </Card>
      <Card className="mb-3 p-4">
        <p className="mb-3 flex items-center gap-2 text-[16px] font-bold"><Megaphone size={18} className="text-primary" /> Advertising performance</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="font-display text-xl font-bold">{ad?.impressions ?? 0}</p><p className="text-xs text-muted">Impressions</p></div>
          <div><p className="font-display text-xl font-bold">{ad?.clicks ?? 0}</p><p className="text-xs text-muted">Clicks</p></div>
          <div><p className="font-display text-xl font-bold">{ad && ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0"}%</p><p className="text-xs text-muted">CTR</p></div>
        </div>
      </Card>
      <Card className="mb-4 divide-y divide-line overflow-hidden">
        <MenuRow icon={Headset} label="Help & Support" value="support@gig.demo" onClick={() => toast("Support: support@gig.demo")} />
        <MenuRow icon={FileText} label="Terms & Conditions" href="/terms/" />
        <MenuRow icon={Lock} label="Privacy Policy" href="/privacy/" />
      </Card>
      <Button full size="lg" variant="danger" icon={LogOut} onClick={() => { logout(); router.push("/login/"); }}>Log out</Button>
    </>
  );
}

