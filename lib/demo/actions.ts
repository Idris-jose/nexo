"use client";
import { mutate, resetState } from "./store";
import * as ops from "./ops";
import { demoNextStepOp } from "./demo-step";
import { sessionId } from "./session";
import type { Result } from "./otp";
import type { AdSlot, Gig, VerificationStatus } from "./types";

export const reset = resetState;

export function postGig(requestorId: string, fields: Parameters<typeof ops.postGigOp>[2]) {
  let id = "";
  mutate((s) => (id = ops.postGigOp(s, requestorId, fields)));
  return id;
}
export function instantBook(requestorId: string, vendorId: string, fields: Parameters<typeof ops.instantBookOp>[3]) {
  let id = "";
  mutate((s) => (id = ops.instantBookOp(s, requestorId, vendorId, fields)));
  return id;
}
export const selectBid = (bidId: string) => mutate((s) => ops.selectBidOp(s, bidId));
export const unselectBid = (gigId: string) => mutate((s) => ops.unselectBidOp(s, gigId));
export const confirmPayment = (gigId: string) => mutate((s) => ops.confirmPaymentOp(s, gigId));
export const placeBid = (vendorId: string, gigId: string, cents: number, eta: number, note?: string) =>
  mutate((s) => ops.placeBidOp(s, vendorId, gigId, cents, eta, note));
export const withdrawBid = (bidId: string) =>
  mutate((s) => {
    const b = s.bids.find((x) => x.id === bidId);
    if (b?.status === "pending") b.status = "withdrawn";
  });
export const vendorAccept = (gigId: string) => mutate((s) => ops.vendorAcceptOp(s, gigId));
export const vendorDecline = (gigId: string) => mutate((s) => ops.vendorDeclineOp(s, gigId));
export const cancelGig = (gigId: string) => mutate((s) => ops.cancelGigOp(s, gigId));
export const startTravel = (gigId: string) => mutate((s) => ops.startTravelOp(s, gigId));
export const arrive = (gigId: string) => mutate((s) => ops.arriveOp(s, gigId));
export function verifyStart(gigId: string, code: string): Result {
  let r: Result = { ok: false, error: "Gig not found" };
  mutate((s) => (r = ops.verifyStartOp(s, gigId, code)));
  return r;
}
export function resendCode(gigId: string, which: "start" | "completion"): Result {
  let r: Result = { ok: true };
  mutate((s) => (r = ops.resendCodeOp(s, gigId, which)));
  return r;
}
export const finishInspection = (gigId: string) => mutate((s) => ops.finishInspectionOp(s, gigId));
export const markComplete = (gigId: string, minutes?: number) => mutate((s) => ops.markCompleteOp(s, gigId, minutes));
export function verifyCompletion(gigId: string, code: string): Result {
  let r: Result = { ok: false, error: "Gig not found" };
  mutate((s) => (r = ops.verifyCompletionOp(s, gigId, code)));
  return r;
}
export const submitReview = (gigId: string, rating: number, text: string) => mutate((s) => ops.reviewOp(s, gigId, rating, text));
export const rateCustomer = (gigId: string, rating: number, text: string) => mutate((s) => ops.rateCustomerOp(s, gigId, rating, text));
export const toggleSaved = (userId: string, vendorId: string) =>
  mutate((s) => {
    const u = ops.userById(s, userId);
    if (!u) return;
    const set = new Set(u.saved ?? []);
    if (set.has(vendorId)) set.delete(vendorId);
    else set.add(vendorId);
    u.saved = [...set];
  });
/** Requestor location selector on Home: sets the area used for nearby providers and new gigs. */
export const setArea = (userId: string, areaKey: string) =>
  mutate((s) => {
    const u = ops.userById(s, userId);
    if (u) u.area = areaKey;
  });
export const setOnline = (userId: string, online: boolean) =>
  mutate((s) => {
    const u = ops.userById(s, userId);
    if (u) u.online = online;
  });
export const withdraw = (vendorId: string) =>
  mutate((s) => {
    const v = ops.userById(s, vendorId);
    if (!v || !v.walletCents) return;
    s.payouts.unshift({ id: ops.uid("po"), vendorId, title: "Withdrawal to FNB •• 8821", grossCents: v.walletCents, commissionCents: 0, netCents: -v.walletCents, status: "processing", at: Date.now() });
    v.walletCents = 0;
    ops.notify(s, vendorId, "Withdrawal requested", "Funds usually reflect within 1–2 business days.", "/vendor/#/earnings", "gray");
  });
export const sendMessage = (gigId: string, fromId: string, text: string) =>
  mutate((s) => {
    s.messages.push({ id: ops.uid("m"), gigId, fromId, text: text.trim(), at: Date.now() });
    const gig = s.gigs.find((g) => g.id === gigId);
    if (!gig) return;
    const to = fromId === gig.requestorId ? gig.vendorId : gig.requestorId;
    if (to)
      ops.notify(s, to, `Message from ${ops.userById(s, fromId)?.short}`, text.slice(0, 80), to === gig.requestorId ? `/app/#/messages/${gigId}` : `/vendor/#/messages/${gigId}`, "gray");
  });
export const markAllRead = (userId: string) => mutate((s) => s.notices.forEach((n) => n.userId === userId && (n.read = true)));
export const trackAd = (slot: AdSlot, field: "impressions" | "clicks") =>
  mutate((s) => {
    const ad = s.ads.find((a) => a.slot === slot);
    if (ad) ad[field] += 1;
  });
export const setVerification = (userId: string, status: VerificationStatus) =>
  mutate((s) => {
    const u = ops.userById(s, userId);
    if (!u?.verification) return;
    u.verification = { identity: status, address: status, skills: status };
    ops.notify(s, userId, status === "verified" ? "You are verified" : "Verification unsuccessful", undefined, "/vendor/#/profile", status === "verified" ? "green" : "gray");
  });

export function demoNextStep(gigId: string, viewer: "requestor" | "vendor"): string | null {
  let text: string | null = null;
  mutate((s) => (text = demoNextStepOp(s, gigId, viewer, sessionId())));
  return text;
}

// Simulated counterparts no longer act on a timer: the other side's moves are played only
// from the "Demo mode" panel (demoNextStep), so the user drives every step of the flow.

export type { Gig };

/** Port of the live sign-up: creates a requestor or vendor and returns the new id. */
export function signup(phone: string, name: string, role: "requestor" | "vendor", service?: string, areaKey = "hatfield"): string {
  const id = ops.uid("u");
  mutate((s) => {
    const words = name.trim().split(/\s+/);
    const short = words.length > 1 ? `${words[0]} ${words[words.length - 1][0]}.` : words[0];
    const user = {
      id, name: name.trim(), short, initials: (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase(), phone, role, area: areaKey,
      hue: Math.floor(Math.random() * 360), simulated: false, status: "active" as const, joined: String(new Date().getFullYear()),
      rating: 0, reviewCount: 0, completed: 0, saved: [] as string[],
    };
    if (role === "vendor")
      Object.assign(user, {
        service: service ?? "repairs", rateCents: 20000, online: false, responseRate: 100,
        verification: { identity: "pending", address: "unverified", skills: "unverified" }, certifications: [], lifetimeCents: 0, walletCents: 0,
      });
    s.users.push(user);
    ops.notify(
      s, id, `Welcome to NEXO®, ${words[0]}`,
      role === "vendor" ? "Complete verification to start receiving gigs." : "Post your first gig or find a vendor nearby.",
      role === "vendor" ? "/vendor/#/profile" : "/app/#/post",
    );
  });
  return id;
}

/** Demo KYC: "uploading" a document marks it pending review by the trust team. */
export const submitKycDoc = (userId: string, doc: "identity" | "address" | "skills") =>
  mutate((s) => {
    const u = ops.userById(s, userId);
    if (!u?.verification || u.verification[doc] === "verified") return;
    u.verification[doc] = "pending";
  });
