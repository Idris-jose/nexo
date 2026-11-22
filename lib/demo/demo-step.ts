import { eligible, finishInspectionOp, markCompleteOp, reviewOp, startTravelOp, userById, vendorAcceptOp, verifyCompletionOp, verifyStartOp, arriveOp, confirmPaymentOp } from "./ops";
import { runJob } from "./jobs";
import type { Gig, State, Viewer } from "./types";

/** Label for the "Demo mode" button, or null when the panel should be hidden. */
export function demoLabel(gig: Gig, viewer: Viewer, hasMyPendingBid: boolean): string | null {
  if (viewer === "requestor") {
    switch (gig.status) {
      case "bidding": return "Simulate a vendor bid";
      case "vendor_selected": return "Vendor accepts the request";
      case "accepted": return "Vendor starts travelling";
      case "traveling": return "Vendor arrives";
      case "start_verification": return "Vendor enters your start code";
      case "active": return gig.stage === "inspection" ? "Vendor finishes inspection" : "Vendor marks the gig complete";
      default: return null;
    }
  }
  switch (gig.status) {
    case "bidding": return hasMyPendingBid ? "Requestor accepts your bid" : null;
    case "payment_pending": return "Requestor confirms payment";
    case "start_verification": return "Requestor sends you the start code";
    case "completion_verification": return "Requestor verifies completion";
    case "completed": return gig.review ? null : "Requestor leaves a review";
    default: return null;
  }
}

/** Plays the other side's next step on a draft state. Returns the toast text or null. */
export function demoNextStepOp(s: State, gigId: string, viewer: Viewer, viewerId: string | null): string | null {
  const gig = s.gigs.find((g) => g.id === gigId);
  if (!gig) return null;
  const v = userById(s, gig.vendorId);
  const r = userById(s, gig.requestorId);
  if (viewer === "requestor") {
    switch (gig.status) {
      case "bidding": {
        const sim = s.users.find((u) => u.simulated && eligible(s, u, gig) && !s.bids.some((b) => b.gigId === gig.id && b.vendorId === u.id));
        if (!sim) return null;
        runJob(s, { kind: "auto_bid", gigId: gig.id, data: { vendorId: sim.id, factor: 0.97 } });
        return `${sim.short} placed a bid.`;
      }
      case "vendor_selected":
        vendorAcceptOp(s, gig.id);
        return `${v?.short} accepted your request.`;
      case "accepted":
        startTravelOp(s, gig.id);
        return `${v?.short} started travelling.`;
      case "traveling":
        arriveOp(s, gig.id);
        return `${v?.short} arrived.`;
      case "start_verification":
        if (gig.startOtp) verifyStartOp(s, gig.id, gig.startOtp.code);
        return `${v?.short} entered your start code.`;
      case "active":
        if (gig.stage === "inspection") {
          finishInspectionOp(s, gig.id);
          return "Inspection completed.";
        }
        markCompleteOp(s, gig.id, gig.mode === "instant" ? 180 : undefined);
        runJob(s, { kind: "vendor_share_code", gigId: gig.id });
        return `${v?.short} marked the gig complete and sent you the code in Messages.`;
      default:
        return null;
    }
  }
  switch (gig.status) {
    case "bidding": {
      const bid = s.bids.find((b) => b.gigId === gig.id && b.vendorId === viewerId && b.status === "pending");
      if (!bid) return null;
      gig.selectedBidId = bid.id;
      gig.vendorId = bid.vendorId;
      gig.agreedCents = bid.amountCents;
      gig.status = "payment_pending";
      confirmPaymentOp(s, gig.id);
      return `${r?.short} accepted your bid and paid.`;
    }
    case "payment_pending":
      confirmPaymentOp(s, gig.id);
      return `${r?.short} confirmed payment.`;
    case "start_verification":
      runJob(s, { kind: "requestor_share_code", gigId: gig.id });
      return `${r?.short} sent you the start code in Messages.`;
    case "completion_verification":
      if (gig.completionOtp) verifyCompletionOp(s, gig.id, gig.completionOtp.code);
      return `${r?.short} verified completion. Payment released.`;
    case "completed":
      if (gig.review) return null;
      reviewOp(s, gig.id, 5, "Excellent service, thank you!");
      return `${r?.short} left a 5-star review.`;
    default:
      return null;
  }
}
