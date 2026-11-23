/**
 * Pure state operations (mutate a draft State). Ported 1:1 from the live demo store.
 * Public, persisted wrappers live in actions.ts.
 */
import { MINUTE, RADIUS_KM } from "./constants";
import { area, km } from "./geo";
import { bidBreakdown, instantSettlement, instantUpfront } from "./money";
import { checkOtp, newOtp, type Result } from "./otp";
import { scheduleFor, schedule } from "./jobs";
import type { Gig, Payment, Settlement, State, Tone, User, Viewer } from "./types";

export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
export const userById = (s: State, id?: string) => s.users.find((u) => u.id === id);
export const gigLink = (g: Gig, role: Viewer) => (role === "requestor" ? `/app/#/gig/${g.id}` : `/vendor/#/job/${g.id}`);

export function notify(s: State, userId: string, title: string, body?: string, href?: string, tone: Tone = "green") {
  s.notices.unshift({ id: uid("n"), userId, title, body, href, tone, at: Date.now(), read: false });
}

export function systemMessage(s: State, gigId: string, text: string) {
  s.messages.push({ id: uid("m"), gigId, fromId: null, text, at: Date.now() });
}

export function eligible(_s: State, v: User, g: Gig): boolean {
  return (
    v.role === "vendor" &&
    v.status === "active" &&
    v.service === g.service &&
    v.verification?.identity === "verified" &&
    !!v.online &&
    km(v.area, g.area) <= RADIUS_KM &&
    v.id !== g.requestorId
  );
}

export function nearbyVendors(s: State, service: string, areaKey: string) {
  return s.users
    .filter((u) => u.role === "vendor" && u.status === "active" && u.service === service && u.verification?.identity === "verified" && km(u.area, areaKey) <= RADIUS_KM)
    .map((vendor) => ({ vendor, km: km(vendor.area, areaKey) }))
    .sort((a, b) => +!!b.vendor.online - +!!a.vendor.online || a.km - b.km);
}

export function postGigOp(s: State, requestorId: string, fields: Pick<Gig, "service" | "title" | "description" | "photos" | "budgetCents" | "timing" | "area" | "address">): string {
  const gig: Gig = { id: uid("g"), ref: `GIG-${++s.seq}`, requestorId, mode: "bid", ...fields, status: "bidding", createdAt: Date.now() };
  s.gigs.unshift(gig);
  const vendors = s.users.filter((u) => eligible(s, u, gig));
  vendors.forEach((v) =>
    notify(s, v.id, "New gig near you", `${gig.title} · ${area(gig.area).suburb} · ${km(v.area, gig.area)} km`, `/vendor/#/opportunity/${gig.id}`),
  );
  vendors
    .filter((v) => v.simulated)
    .slice(0, 2)
    .forEach((v, i) => schedule(s, "auto_bid", gig.id, 5000 + i * 8000, { vendorId: v.id, factor: i === 0 ? 0.94 : 1.03 }));
  notify(s, requestorId, "Your gig is live", `${vendors.length} verified ${vendors.length === 1 ? "vendor" : "vendors"} nearby can bid.`, `/app/#/gig/${gig.id}`);
  return gig.id;
}

export function instantBookOp(s: State, requestorId: string, vendorId: string, fields: Pick<Gig, "service" | "title" | "description" | "photos" | "timing" | "area" | "address">): string {
  const v = userById(s, vendorId);
  if (!v?.rateCents) throw new Error("Vendor not found");
  const gig: Gig = { id: uid("g"), ref: `GIG-${++s.seq}`, requestorId, vendorId, mode: "instant", ...fields, hourlyRateCents: v.rateCents, status: "vendor_selected", createdAt: Date.now() };
  s.gigs.unshift(gig);
  notify(s, vendorId, "New instant request", `${gig.title} · ${area(gig.area).suburb}`, gigLink(gig, "vendor"), "gold");
  scheduleFor(s, gig);
  return gig.id;
}

export function selectBidOp(s: State, bidId: string) {
  const bid = s.bids.find((b) => b.id === bidId);
  const gig = bid && s.gigs.find((g) => g.id === bid.gigId);
  if (!bid || !gig || gig.status !== "bidding" || bid.status !== "pending") return;
  gig.selectedBidId = bid.id;
  gig.vendorId = bid.vendorId;
  gig.agreedCents = bid.amountCents;
  gig.status = "payment_pending";
  scheduleFor(s, gig);
}

export function unselectBidOp(s: State, gigId: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "payment_pending" || gig.mode !== "bid") return;
  gig.status = "bidding";
  gig.selectedBidId = undefined;
  gig.vendorId = undefined;
  gig.agreedCents = undefined;
}

export function confirmPaymentOp(s: State, gigId: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "payment_pending" || !gig.vendorId) return;
  const now = Date.now();
  const pay = (kind: Payment["kind"], amountCents: number, status: Payment["status"]) =>
    s.payments.push({ id: uid("p"), gigId, payerId: gig.requestorId, kind, amountCents, status, at: now });
  if (gig.mode === "bid") {
    const b = bidBreakdown(gig.agreedCents!);
    pay("service_fee", b.serviceFeeCents, "captured");
    pay("bid_amount", b.serviceCents, "authorized");
    s.bids.forEach((bid) => {
      if (bid.gigId !== gigId) return;
      if (bid.id === gig.selectedBidId) bid.status = "accepted";
      else if (bid.status === "pending") {
        bid.status = "rejected";
        notify(s, bid.vendorId, "Bid not selected", `${gig.title} went to another vendor.`, undefined, "gray");
      }
    });
  } else {
    const u = instantUpfront(gig.hourlyRateCents!);
    pay("service_fee", u.serviceFeeCents, "captured");
    pay("first_hour", u.firstHourCents, "authorized");
  }
  gig.status = "accepted";
  gig.paidAt = now;
  gig.addressReleasedAt = now;
  const v = userById(s, gig.vendorId)!;
  const r = userById(s, gig.requestorId)!;
  systemMessage(s, gigId, `${v.short} is booked. Payment is protected until service completion.`);
  notify(s, gig.vendorId, gig.mode === "bid" ? "You won the bid!" : "Booking confirmed", `${r.short} confirmed ${gig.title}. The exact address is now available.`, gigLink(gig, "vendor"));
  notify(s, gig.requestorId, "Booking confirmed", `${v.short} will head over soon.`, gigLink(gig, "requestor"));
  scheduleFor(s, gig);
}

function settle(s: State, gig: Gig) {
  const now = Date.now();
  let st: Settlement;
  if (gig.mode === "bid") {
    const b = bidBreakdown(gig.agreedCents!);
    st = { serviceCents: b.serviceCents, feeCents: b.serviceFeeCents, totalCents: b.requestorTotalCents, commissionCents: b.commissionCents, payoutCents: b.vendorPayoutCents };
    s.payments.filter((p) => p.gigId === gig.id && p.kind === "bid_amount").forEach((p) => (p.status = "captured"));
  } else {
    const x = instantSettlement(gig.hourlyRateCents!, gig.actualMinutes ?? 60);
    st = {
      serviceCents: x.serviceCents, feeCents: x.serviceFeeCents, totalCents: x.requestorTotalCents, commissionCents: x.commissionCents,
      payoutCents: x.vendorPayoutCents, billableMinutes: x.billableMinutes, firstHourCents: x.firstHourCents, remainingCents: x.remainingCents,
    };
    s.payments.filter((p) => p.gigId === gig.id && p.kind === "first_hour").forEach((p) => (p.status = "captured"));
    if (x.remainingCents > 0) s.payments.push({ id: uid("p"), gigId: gig.id, payerId: gig.requestorId, kind: "remaining_hours", amountCents: x.remainingCents, status: "captured", at: now });
  }
  gig.settlement = st;
  gig.status = "completed";
  gig.stage = "gig_completed";
  gig.completedAt = now;
  const v = userById(s, gig.vendorId)!;
  v.completed += 1;
  v.lifetimeCents = (v.lifetimeCents ?? 0) + st.payoutCents;
  v.walletCents = (v.walletCents ?? 0) + st.payoutCents;
  const r = userById(s, gig.requestorId)!;
  r.completed += 1;
  s.payouts.unshift({ id: uid("po"), vendorId: v.id, gigId: gig.id, title: gig.title, grossCents: st.serviceCents, commissionCents: st.commissionCents, netCents: st.payoutCents, status: "paid", at: now });
  systemMessage(s, gig.id, "Completion verified. Payment released to the vendor.");
  notify(s, v.id, "Payment released", `${gig.title} · you received your payout.`, gigLink(gig, "vendor"), "gold");
  notify(s, r.id, "Gig completed", `Rate ${v.short} to help the community.`, gigLink(gig, "requestor"));
  scheduleFor(s, gig);
}

export function verifyCompletionOp(s: State, gigId: string, code: string): Result {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "completion_verification" || !gig.completionOtp) return { ok: false, error: "This gig is not waiting for completion." };
  const res = checkOtp(gig.completionOtp, code);
  if (res.ok) settle(s, gig);
  return res;
}

export function reviewOp(s: State, gigId: string, rating: number, text: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "completed" || gig.review) return;
  gig.review = { rating, text, at: Date.now() };
  const v = userById(s, gig.vendorId)!;
  v.rating = Math.round(((v.rating * v.reviewCount + rating) / (v.reviewCount + 1)) * 10) / 10;
  v.reviewCount += 1;
  notify(s, v.id, `New ${rating}-star review`, text || undefined, "/vendor/#/reviews", "gold");
}

/** Vendor rates the requestor once the gig is completed (feeds the requestor's own rating). */
export function rateCustomerOp(s: State, gigId: string, rating: number, text: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "completed" || gig.customerReview) return;
  gig.customerReview = { rating, text, at: Date.now() };
  const r = userById(s, gig.requestorId);
  if (!r) return;
  r.rating = Math.round(((r.rating * r.reviewCount + rating) / (r.reviewCount + 1)) * 10) / 10;
  r.reviewCount += 1;
}

export function cancelGigOp(s: State, gigId: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || !["bidding", "vendor_selected", "payment_pending"].includes(gig.status)) return;
  gig.status = "cancelled";
  gig.cancelledAt = Date.now();
  s.bids.filter((b) => b.gigId === gigId && b.status === "pending").forEach((b) => (b.status = "rejected"));
  s.jobs = s.jobs.filter((j) => j.gigId !== gigId);
  if (gig.vendorId) notify(s, gig.vendorId, "Request cancelled", gig.title, undefined, "gray");
}

export function placeBidOp(s: State, vendorId: string, gigId: string, amountCents: number, etaMinutes: number, note?: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  const v = userById(s, vendorId);
  if (!gig || !v || gig.status !== "bidding" || !eligible(s, v, gig)) return;
  const existing = s.bids.find((b) => b.gigId === gigId && b.vendorId === vendorId && b.status === "pending");
  if (existing) {
    existing.amountCents = amountCents;
    existing.etaMinutes = etaMinutes;
    existing.note = note;
    return;
  }
  const bid = { id: uid("b"), gigId, vendorId, amountCents, etaMinutes, note, status: "pending" as const, createdAt: Date.now() };
  s.bids.push(bid);
  notify(s, gig.requestorId, "New bid received", `${v.short} bid on ${gig.title}.`, gigLink(gig, "requestor"), "gold");
  if (userById(s, gig.requestorId)?.simulated) schedule(s, "requestor_accept_bid", gig.id, 8000, { bidId: bid.id });
}

export function vendorAcceptOp(s: State, gigId: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "vendor_selected") return;
  gig.status = "payment_pending";
  const v = userById(s, gig.vendorId)!;
  notify(s, gig.requestorId, `${v.short} accepted your request`, "Confirm payment to book them.", gigLink(gig, "requestor"), "gold");
  scheduleFor(s, gig);
}

export function vendorDeclineOp(s: State, gigId: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "vendor_selected") return;
  gig.status = "cancelled";
  gig.cancelledAt = Date.now();
  notify(s, gig.requestorId, "Vendor unavailable", `${userById(s, gig.vendorId)?.short} can't take ${gig.title}. Try another vendor.`, "/app/#/find", "gray");
}

export function startTravelOp(s: State, gigId: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "accepted") return;
  const v = userById(s, gig.vendorId)!;
  gig.status = "traveling";
  gig.travelStartedAt = Date.now();
  gig.etaMinutes = Math.max(6, Math.round(km(v.area, gig.area) * 2.2));
  notify(s, gig.requestorId, `${v.short} is on the way`, `ETA about ${gig.etaMinutes} min.`, gigLink(gig, "requestor"));
  scheduleFor(s, gig);
}

export function arriveOp(s: State, gigId: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "traveling") return;
  gig.status = "start_verification";
  gig.stage = "arrival_at_location";
  gig.arrivedAt = Date.now();
  gig.startOtp = newOtp();
  const v = userById(s, gig.vendorId)!;
  notify(s, gig.requestorId, `${v.short} has arrived`, "Share your start code to begin the job.", gigLink(gig, "requestor"));
  systemMessage(s, gigId, `${v.short} has arrived. Start code sent to the service requestor.`);
  scheduleFor(s, gig);
}

export function verifyStartOp(s: State, gigId: string, code: string): Result {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "start_verification" || !gig.startOtp) return { ok: false, error: "This gig is not waiting for a start code." };
  const res = checkOtp(gig.startOtp, code);
  if (!res.ok) return res;
  gig.status = "active";
  gig.stage = "inspection";
  gig.startedAt = Date.now();
  notify(s, gig.requestorId, "Gig started", "Start code verified.", gigLink(gig, "requestor"));
  systemMessage(s, gigId, "Start code verified. The gig has started.");
  scheduleFor(s, gig);
  return { ok: true };
}

export function resendCodeOp(s: State, gigId: string, which: "start" | "completion"): Result {
  const gig = s.gigs.find((g) => g.id === gigId);
  const otp = which === "start" ? gig?.startOtp : gig?.completionOtp;
  if (!gig || !otp) return { ok: false, error: "No code to resend." };
  if (otp.resends >= 3) return { ok: false, error: "Resend limit reached. Contact support." };
  const next = newOtp(otp.resends + 1);
  if (which === "start") gig.startOtp = next;
  else gig.completionOtp = next;
  scheduleFor(s, gig);
  return { ok: true };
}

export function finishInspectionOp(s: State, gigId: string) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "active" || gig.stage !== "inspection") return;
  gig.stage = "gig";
  systemMessage(s, gigId, "Inspection done. Work in progress.");
  scheduleFor(s, gig);
}

export function markCompleteOp(s: State, gigId: string, minutes?: number) {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig || gig.status !== "active" || gig.stage !== "gig") return;
  gig.status = "completion_verification";
  gig.completeMarkedAt = Date.now();
  if (gig.mode === "instant") {
    const elapsed = Math.round((Date.now() - (gig.startedAt ?? Date.now())) / MINUTE);
    gig.actualMinutes = minutes ?? Math.max(60, elapsed);
  }
  gig.completionOtp = newOtp();
  const v = userById(s, gig.vendorId)!;
  notify(s, gig.requestorId, `${v.short} marked the gig complete`, "Enter the completion code from your vendor to release payment.", gigLink(gig, "requestor"), "gold");
  systemMessage(s, gigId, "Vendor marked the gig complete. Completion code sent to the vendor.");
  scheduleFor(s, gig);
}

export function vendorShareCodeOp(s: State, gig: Gig) {
  if (gig.status !== "completion_verification" || !gig.completionOtp || !gig.vendorId) return;
  s.messages.push({ id: uid("m"), gigId: gig.id, fromId: gig.vendorId, text: `All done! My completion code is ${gig.completionOtp.code}.`, at: Date.now() });
  notify(s, gig.requestorId, `${userById(s, gig.vendorId)?.short} sent the completion code`, "Open the gig to verify completion.", gigLink(gig, "requestor"), "gold");
}

export function requestorShareCodeOp(s: State, gig: Gig) {
  if (gig.status !== "start_verification" || !gig.startOtp) return;
  s.messages.push({ id: uid("m"), gigId: gig.id, fromId: gig.requestorId, text: `Hi! My start code is ${gig.startOtp.code}.`, at: Date.now() });
  if (gig.vendorId) notify(s, gig.vendorId, `${userById(s, gig.requestorId)?.short} sent the start code`, `Code: ${gig.startOtp.code}`, gigLink(gig, "vendor"), "gold");
}
