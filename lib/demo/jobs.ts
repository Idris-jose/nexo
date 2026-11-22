import { km } from "./geo";
import {
  arriveOp, confirmPaymentOp, finishInspectionOp, markCompleteOp, placeBidOp, requestorShareCodeOp, reviewOp,
  startTravelOp, uid, userById, vendorAcceptOp, vendorShareCodeOp, verifyCompletionOp, verifyStartOp,
} from "./ops";
import type { Gig, Job, JobKind, State } from "./types";

export function schedule(s: State, kind: JobKind, gigId: string, delayMs: number, data?: Job["data"]) {
  const dup = s.jobs.some((j) => j.kind === kind && j.gigId === gigId && JSON.stringify(j.data) === JSON.stringify(data));
  if (!dup) s.jobs.push({ id: uid("j"), kind, gigId, due: Date.now() + delayMs, data });
}

/** Schedules the simulated counterpart's next move for a gig. */
export function scheduleFor(s: State, gig: Gig) {
  const simVendor = !!userById(s, gig.vendorId)?.simulated;
  const simRequestor = !!userById(s, gig.requestorId)?.simulated;
  switch (gig.status) {
    case "vendor_selected":
      if (simVendor) schedule(s, "vendor_accept", gig.id, 5000);
      break;
    case "payment_pending":
      if (simRequestor) schedule(s, "requestor_pay", gig.id, 4000);
      break;
    case "accepted":
      if (simVendor) schedule(s, "vendor_start_travel", gig.id, 4000);
      break;
    case "traveling":
      if (simVendor) schedule(s, "vendor_arrive", gig.id, 10000);
      break;
    case "start_verification":
      if (simRequestor) schedule(s, "requestor_share_code", gig.id, 3500);
      if (simVendor) schedule(s, "vendor_enter_start", gig.id, 12000);
      break;
    case "active":
      if (simVendor) schedule(s, gig.stage === "inspection" ? "vendor_stage" : "vendor_complete", gig.id, 7000, { stage: gig.stage ?? "" });
      break;
    case "completion_verification":
      if (simVendor) schedule(s, "vendor_share_code", gig.id, 2500);
      if (simRequestor) schedule(s, "requestor_verify_completion", gig.id, 8000);
      break;
    case "completed":
      if (simRequestor && !gig.review) schedule(s, "requestor_review", gig.id, 5000);
      break;
  }
}

const BID_NOTES = [
  "Available today, I can bring all materials.",
  "Happy to help, I have done this type of job many times.",
  "Can start as soon as you confirm.",
];
const REVIEWS = [
  "Professional, on time and tidy. Highly recommend.",
  "Great work, will book again.",
  "Friendly and efficient. Thank you!",
];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

export function runJob(s: State, job: Pick<Job, "kind" | "gigId" | "data">) {
  const gig = s.gigs.find((g) => g.id === job.gigId);
  if (!gig) return;
  switch (job.kind) {
    case "auto_bid": {
      const v = userById(s, String(job.data?.vendorId));
      if (!v || gig.status !== "bidding" || !gig.budgetCents) return;
      const amount = Math.round((gig.budgetCents * Number(job.data?.factor ?? 1)) / 1000) * 1000;
      const eta = Math.max(15, Math.round(km(v.area, gig.area) * 4) + 10);
      placeBidOp(s, v.id, gig.id, amount, eta, pick(BID_NOTES));
      return;
    }
    case "vendor_accept":
      return vendorAcceptOp(s, gig.id);
    case "vendor_start_travel":
      return startTravelOp(s, gig.id);
    case "vendor_arrive":
      return arriveOp(s, gig.id);
    case "vendor_enter_start":
      if (gig.startOtp) verifyStartOp(s, gig.id, gig.startOtp.code);
      return;
    case "vendor_stage":
      return finishInspectionOp(s, gig.id);
    case "vendor_complete":
      return markCompleteOp(s, gig.id, gig.mode === "instant" ? 150 : undefined);
    case "vendor_share_code":
      return vendorShareCodeOp(s, gig);
    case "requestor_accept_bid": {
      const bid = s.bids.find((b) => b.id === String(job.data?.bidId));
      if (!bid || bid.status !== "pending" || gig.status !== "bidding") return;
      gig.selectedBidId = bid.id;
      gig.vendorId = bid.vendorId;
      gig.agreedCents = bid.amountCents;
      gig.status = "payment_pending";
      return confirmPaymentOp(s, gig.id);
    }
    case "requestor_pay":
      return confirmPaymentOp(s, gig.id);
    case "requestor_share_code":
      return requestorShareCodeOp(s, gig);
    case "requestor_verify_completion":
      if (gig.completionOtp) verifyCompletionOp(s, gig.id, gig.completionOtp.code);
      return;
    case "requestor_review":
      return reviewOp(s, gig.id, 5, pick(REVIEWS));
  }
}

/** Runs every due job in due order. Returns true if anything ran. */
export function runDueJobs(s: State, now = Date.now()): boolean {
  const due = s.jobs.filter((j) => j.due <= now).sort((a, b) => a.due - b.due);
  if (!due.length) return false;
  s.jobs = s.jobs.filter((j) => j.due > now);
  due.forEach((j) => runJob(s, j));
  return true;
}
