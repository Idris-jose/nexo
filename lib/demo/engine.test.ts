import { describe, expect, it } from "vitest";
import { bidBreakdown, billableMinutes, formatRand, instantSettlement } from "./money";
import { checkOtp } from "./otp";
import { createSeed } from "./seed";
import * as ops from "./ops";
import { runJob } from "./jobs";

describe("money", () => {
  it("bid breakdown applies 12% commission and R30 fee", () => {
    const b = bidBreakdown(150000);
    expect(b.commissionCents).toBe(18000);
    expect(b.vendorPayoutCents).toBe(132000);
    expect(b.requestorTotalCents).toBe(153000);
  });
  it("bills instant work per 15 min, minimum 1 hour", () => {
    expect(billableMinutes(10)).toBe(60);
    expect(billableMinutes(61)).toBe(75);
    const x = instantSettlement(25000, 150);
    expect(x.serviceCents).toBe(62500);
    expect(x.remainingCents).toBe(37500);
  });
  it("formats rand like the Figma (R85,020)", () => {
    expect(formatRand(150000)).toBe("R1,500");
    expect(formatRand(8502000)).toBe("R85,020");
    expect(formatRand(2050)).toBe("R20.50");
    expect(formatRand(-320000)).toBe("-R3,200");
  });
});

describe("otp", () => {
  it("reports errors in order and counts attempts", () => {
    const otp = { code: "123456", expiresAt: Date.now() + 60000, attempts: 0, resends: 0 };
    expect(checkOtp(otp, "000000")).toEqual({ ok: false, error: "That code doesn't match. 4 tries left." });
    otp.attempts = 3;
    expect(checkOtp(otp, "000000")).toEqual({ ok: false, error: "That code doesn't match. 1 try left." });
    expect(checkOtp(otp, "000000")).toEqual({ ok: false, error: "Too many attempts. Request a new code." });
    expect(checkOtp({ ...otp, attempts: 0, expiresAt: Date.now() - 1 }, "123456").ok).toBe(false);
  });
});

describe("gig flow", () => {
  it("runs bid → pay → travel → codes → settlement → review", () => {
    const s = createSeed();
    ops.selectBidOp(s, "b_p2");
    ops.confirmPaymentOp(s, "g_bids");
    const gig = s.gigs.find((g) => g.id === "g_bids")!;
    expect(gig.status).toBe("accepted");
    expect(s.bids.find((b) => b.id === "b_p1")!.status).toBe("rejected");
    ops.startTravelOp(s, gig.id);
    ops.arriveOp(s, gig.id);
    expect(ops.verifyStartOp(s, gig.id, gig.startOtp!.code).ok).toBe(true);
    ops.finishInspectionOp(s, gig.id);
    ops.markCompleteOp(s, gig.id);
    const before = s.users.find((u) => u.id === "u_bongani")!.walletCents!;
    expect(ops.verifyCompletionOp(s, gig.id, gig.completionOtp!.code).ok).toBe(true);
    expect(gig.status).toBe("completed");
    expect(gig.settlement!.payoutCents).toBe(55000 - 6600);
    expect(s.users.find((u) => u.id === "u_bongani")!.walletCents).toBe(before + 48400);
    ops.reviewOp(s, gig.id, 5, "Great");
    expect(gig.review!.rating).toBe(5);
    const r = s.users.find((u) => u.id === gig.requestorId)!;
    const count = r.reviewCount;
    ops.rateCustomerOp(s, gig.id, 4, "Clear brief");
    ops.rateCustomerOp(s, gig.id, 1, "dupe ignored");
    expect(gig.customerReview!.rating).toBe(4);
    expect(r.reviewCount).toBe(count + 1);
  });
  it("auto-bids round to R10 and notify the requestor", () => {
    const s = createSeed();
    const id = ops.postGigOp(s, "u_alex", { service: "plumbing", title: "Burst pipe", description: "Pipe burst in the garden", photos: 0, budgetCents: 80000, timing: "asap", area: "hatfield", address: "14 Burnett Street" });
    const jobs = s.jobs.filter((j) => j.gigId === id && j.kind === "auto_bid");
    expect(jobs).toHaveLength(2);
    runJob(s, jobs[0]);
    const bid = s.bids.find((b) => b.gigId === id)!;
    expect(bid.amountCents).toBe(75000);
  });
});
