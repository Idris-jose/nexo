import { BILLING_STEP_MIN, COMMISSION_BPS, MIN_BILLABLE_MIN, SERVICE_FEE_CENTS } from "./constants";

function assertCents(v: number, label: string) {
  if (!Number.isInteger(v) || v < 0) {
    throw new RangeError(`${label} must be a non-negative integer number of cents (got ${v})`);
  }
}

/** amount × bps / 10 000, rounded half up. */
export function applyBps(amount: number, bps: number): number {
  assertCents(amount, "amount");
  if (!Number.isInteger(bps) || bps < 0) throw new RangeError(`bps must be a non-negative integer (got ${bps})`);
  return Math.floor((amount * bps + 5000) / 10000);
}

export const commission = (cents: number) => applyBps(cents, COMMISSION_BPS);

export function bidBreakdown(bidCents: number) {
  assertCents(bidCents, "bid");
  const c = commission(bidCents);
  return {
    serviceCents: bidCents,
    serviceFeeCents: SERVICE_FEE_CENTS,
    requestorTotalCents: bidCents + SERVICE_FEE_CENTS,
    commissionCents: c,
    vendorPayoutCents: bidCents - c,
  };
}

export function billableMinutes(actual: number): number {
  if (!(actual >= 0)) throw new RangeError(`actualMinutes must be a non-negative number (got ${actual})`);
  return Math.max(MIN_BILLABLE_MIN, Math.ceil(actual / BILLING_STEP_MIN) * BILLING_STEP_MIN);
}

export function proRata(rateCents: number, minutes: number): number {
  assertCents(rateCents, "rate");
  if (!Number.isInteger(minutes) || minutes < 0) throw new RangeError(`minutes must be a non-negative integer (got ${minutes})`);
  return Math.floor((rateCents * minutes + 30) / 60);
}

export function instantSettlement(rateCents: number, actualMinutes: number) {
  const billable = billableMinutes(actualMinutes);
  const service = proRata(rateCents, billable);
  const c = commission(service);
  return {
    hourlyRateCents: rateCents,
    actualMinutes,
    billableMinutes: billable,
    serviceCents: service,
    firstHourCents: rateCents,
    remainingCents: service - rateCents,
    serviceFeeCents: SERVICE_FEE_CENTS,
    requestorTotalCents: service + SERVICE_FEE_CENTS,
    commissionCents: c,
    vendorPayoutCents: service - c,
  };
}

export function instantUpfront(rateCents: number) {
  return { serviceFeeCents: SERVICE_FEE_CENTS, firstHourCents: rateCents, totalCents: SERVICE_FEE_CENTS + rateCents };
}

/** Figma money format: "R85,020"; ".50" only when there are cents. */
export function formatRand(cents: number, opts: { alwaysShowCents?: boolean } = {}): string {
  const v = Math.round(cents);
  const neg = v < 0;
  const abs = Math.abs(v);
  const rands = Math.floor(abs / 100);
  const c = abs % 100;
  const grouped = String(rands).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const tail = c || opts.alwaysShowCents ? `.${String(c).padStart(2, "0")}` : "";
  return `${neg ? "-" : ""}R${grouped}${tail}`;
}
