import type { GigStatus, Stage, Timing } from "./types";

export const SERVICE_FEE_CENTS = 3000;
export const COMMISSION_BPS = 1200;
export const BILLING_STEP_MIN = 15;
export const MIN_BILLABLE_MIN = 60;
export const RADIUS_KM = 30;
export const KM_STEP = 0.5;
export const OTP_POLICY = { ttlSeconds: 600, maxAttempts: 5, maxResends: 3 } as const;
export const COPY = { paymentProtection: "Payment protected until service completion." } as const;
export const STATE_VERSION = 6;
export const STATE_KEY = "gig.demo.state";
export const SESSION_KEY = "gig.demo.session";
export const RELOADED_KEY = "gig.demo.reloaded";
export const MINUTE = 60_000;
export const DEMO_LOGIN_OTP = "123456";

export const STAGES: { key: Stage; label: string }[] = [
  { key: "arrival_at_location", label: "Arrival at Location" },
  { key: "inspection", label: "Inspection" },
  { key: "gig", label: "Gig" },
  { key: "gig_completed", label: "Gig Completed" },
];

export const TIMING_LABELS: Record<Timing, string> = {
  asap: "ASAP",
  this_week: "This week",
  flexible: "Flexible",
};

export const ACTIVE_STATUSES: GigStatus[] = [
  "accepted", "traveling", "start_verification", "active", "completion_verification",
];
export const OPEN_STATUSES: GigStatus[] = ["bidding", "vendor_selected", "payment_pending"];

export const DEMO_ACCOUNTS = [
  { id: "u_alex", label: "Service Requestor", phone: "82 123 4567", desc: "Post gigs, compare bids, book vendors, pay and review." },
  { id: "u_john", label: "Vendor (Electrician)", phone: "82 555 0142", desc: "Go online, bid on nearby gigs, do the job, get paid." },
  { id: "u_admin", label: "Admin", phone: "82 000 0001", desc: "Platform overview, verifications, gigs and payments." },
] as const;
