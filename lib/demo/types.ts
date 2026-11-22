export type Role = "requestor" | "vendor" | "admin";
export type VerificationStatus = "verified" | "pending" | "rejected" | "unverified";
export type AreaKey =
  | "hatfield" | "arcadia" | "sunnyside" | "brooklyn" | "menlopark" | "waterkloof"
  | "garsfontein" | "cbd" | "montana" | "lyttelton" | "centurion" | "midrand";

export interface User {
  id: string;
  name: string;
  short: string;
  initials: string;
  phone: string;
  role: Role;
  area: string;
  hue: number;
  simulated: boolean;
  status: "active" | "suspended";
  joined: string;
  rating: number;
  reviewCount: number;
  completed: number;
  saved?: string[];
  // vendor-only
  service?: string;
  rateCents?: number;
  responseRate?: number;
  online?: boolean;
  bio?: string;
  verification?: { identity: VerificationStatus; address: VerificationStatus; skills: VerificationStatus };
  certifications?: string[];
  lifetimeCents?: number;
  walletCents?: number;
}

export type GigStatus =
  | "bidding" | "vendor_selected" | "payment_pending" | "accepted" | "traveling"
  | "start_verification" | "active" | "completion_verification" | "completed" | "cancelled";

export type Stage = "arrival_at_location" | "inspection" | "gig" | "gig_completed";
export type Timing = "asap" | "this_week" | "flexible";

export interface Otp { code: string; expiresAt: number; attempts: number; resends: number }

export interface Settlement {
  serviceCents: number;
  feeCents: number;
  totalCents: number;
  commissionCents: number;
  payoutCents: number;
  billableMinutes?: number;
  firstHourCents?: number;
  remainingCents?: number;
}

export interface Gig {
  id: string;
  ref: string;
  requestorId: string;
  vendorId?: string;
  mode: "bid" | "instant";
  service: string;
  title: string;
  description: string;
  photos: number;
  budgetCents?: number;
  agreedCents?: number;
  hourlyRateCents?: number;
  selectedBidId?: string;
  timing: Timing;
  area: string;
  address: string;
  addressReleasedAt?: number;
  status: GigStatus;
  stage?: Stage;
  createdAt: number;
  paidAt?: number;
  travelStartedAt?: number;
  etaMinutes?: number;
  arrivedAt?: number;
  startedAt?: number;
  completeMarkedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  actualMinutes?: number;
  startOtp?: Otp;
  completionOtp?: Otp;
  settlement?: Settlement;
  review?: { rating: number; text: string; at: number };
}

export interface Bid {
  id: string;
  gigId: string;
  vendorId: string;
  amountCents: number;
  etaMinutes: number;
  note?: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: number;
}

export interface Message { id: string; gigId: string; fromId: string | null; text: string; at: number }

export type Tone = "green" | "gold" | "gray";
export interface Notice {
  id: string;
  userId: string;
  title: string;
  body?: string;
  href?: string;
  tone: Tone;
  at: number;
  read: boolean;
}

export interface Payment {
  id: string;
  gigId: string;
  payerId: string;
  kind: "service_fee" | "bid_amount" | "first_hour" | "remaining_hours";
  amountCents: number;
  status: "captured" | "authorized";
  at: number;
}

export interface Payout {
  id: string;
  vendorId: string;
  gigId?: string;
  title: string;
  grossCents: number;
  commissionCents: number;
  netCents: number;
  status: "paid" | "processing";
  at: number;
}

export type JobKind =
  | "auto_bid" | "vendor_accept" | "vendor_start_travel" | "vendor_arrive" | "vendor_enter_start"
  | "vendor_stage" | "vendor_complete" | "vendor_share_code" | "requestor_accept_bid"
  | "requestor_pay" | "requestor_share_code" | "requestor_verify_completion" | "requestor_review";

export interface Job {
  id: string;
  kind: JobKind;
  gigId: string;
  due: number;
  data?: Record<string, string | number | undefined>;
}

export type AdSlot =
  | "home_dashboard_bottom" | "provider_dashboard_bottom" | "vendor_results_bottom"
  | "gig_history_bottom" | "notifications_bottom";

export interface Ad { id: string; slot: AdSlot; impressions: number; clicks: number }

export interface State {
  version: number;
  seq: number;
  users: User[];
  gigs: Gig[];
  bids: Bid[];
  messages: Message[];
  notices: Notice[];
  payments: Payment[];
  payouts: Payout[];
  jobs: Job[];
  ads: Ad[];
}

export type Viewer = "requestor" | "vendor";
