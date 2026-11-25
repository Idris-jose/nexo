import { MINUTE, SERVICE_FEE_CENTS, STATE_VERSION } from "./constants";
import { defaultAddress } from "./geo";
import { bidBreakdown } from "./money";
import type { Bid, Gig, Message, Notice, Payment, Payout, State, User } from "./types";

type VendorInput = Partial<User> & Pick<User, "id" | "name" | "short" | "phone" | "area" | "hue">;

/** Vendor factory: live-site defaults, then overrides. */
function vendor(e: VendorInput): User {
  return {
    initials: e.short.replace(".", "").split(" ").map((w) => w[0]).join("").toUpperCase(),
    role: "vendor",
    simulated: true,
    status: "active",
    joined: "2025",
    responseRate: 96,
    online: true,
    verification: { identity: "verified", address: "verified", skills: "verified" },
    certifications: [],
    lifetimeCents: 0,
    walletCents: 0,
    rating: 0,
    reviewCount: 0,
    completed: 0,
    ...e,
  } as User;
}

export const SEED_USERS: User[] = [
  { id: "u_alex", name: "Alex Thompson", short: "Alex T.", initials: "AT", phone: "821234567", role: "requestor", area: "hatfield", hue: 24, simulated: false, status: "active", joined: "2025", rating: 4.9, reviewCount: 11, completed: 5, saved: ["u_john", "u_sarah", "u_thabo", "u_mia"] },
  vendor({ id: "u_john", name: "John Mokoena", short: "John M.", phone: "825550142", area: "lyttelton", hue: 145, service: "electrical", rateCents: 25000, rating: 4.8, reviewCount: 120, completed: 18, simulated: false, responseRate: 98, bio: "Registered electrician with 9 years of residential experience. DB boards, fault finding, lighting and certificates of compliance.", certifications: ["Wireman’s Licence", "Certificate of Compliance (COC) issuer"], lifetimeCents: 1245000, walletCents: 874000, joined: "2024" }),
  { id: "u_admin", name: "Thandi Mahlangu", short: "Thandi M.", initials: "TM", phone: "820000001", role: "admin", area: "cbd", hue: 280, simulated: false, status: "active", joined: "2024", rating: 0, reviewCount: 0, completed: 0 },
  vendor({ id: "u_sarah", name: "Sarah Khumalo", short: "Sarah K.", phone: "830001002", area: "brooklyn", service: "painting", rateCents: 18000, rating: 4.9, reviewCount: 180, completed: 301, hue: 330, bio: "Interior and exterior painting. Clean lines, tidy sites, fair quotes." }),
  vendor({ id: "u_thabo", name: "Thabo Sithole", short: "Thabo S.", phone: "830001003", area: "sunnyside", service: "plumbing", rateCents: 20000, rating: 4.7, reviewCount: 95, completed: 167, hue: 205, bio: "Plumber specialising in geysers, leaks and blocked drains." }),
  vendor({ id: "u_mia", name: "Mia Dlamini", short: "Mia D.", phone: "830001004", area: "menlopark", service: "cleaning", rateCents: 15000, rating: 4.8, reviewCount: 142, completed: 210, hue: 12, bio: "Deep cleans and move-out cleans. I bring my own supplies." }),
  vendor({ id: "u_mike", name: "Mike Davids", short: "Mike D.", phone: "830001005", area: "centurion", service: "electrical", rateCents: 23000, rating: 4.6, reviewCount: 58, completed: 98, hue: 190, bio: "Electrician for lighting, plugs and fault finding." }),
  vendor({ id: "u_bongani", name: "Bongani Khoza", short: "Bongani K.", phone: "830001006", area: "arcadia", service: "plumbing", rateCents: 21000, rating: 4.6, reviewCount: 44, completed: 61, hue: 260, bio: "Quick-response plumber for leaks and burst pipes." }),
  vendor({ id: "u_sipho", name: "Sipho Ndlovu", short: "Sipho N.", phone: "830001007", area: "arcadia", service: "repairs", rateCents: 19000, rating: 4.7, reviewCount: 76, completed: 130, hue: 95, bio: "Handyman for doors, shelving, fittings and small repairs." }),
  vendor({ id: "u_kagiso", name: "Kagiso Letsholo", short: "Kagiso L.", phone: "830001008", area: "montana", service: "moving", rateCents: 32000, rating: 4.7, reviewCount: 64, completed: 88, hue: 40, bio: "1-ton bakkie and two helpers for moves and deliveries." }),
  vendor({ id: "u_lerato", name: "Lerato Phiri", short: "Lerato P.", phone: "830001009", area: "garsfontein", service: "tutoring", rateCents: 22000, rating: 4.9, reviewCount: 88, completed: 143, hue: 300, bio: "Maths and Physical Science tutor, Grades 8–12." }),
  vendor({ id: "u_naledi", name: "Naledi Radebe", short: "Naledi R.", phone: "830001010", area: "waterkloof", service: "massage", rateCents: 40000, rating: 4.9, reviewCount: 131, completed: 190, hue: 350, bio: "Qualified massage therapist for relaxation and sports massage." }),
  vendor({ id: "u_zanele", name: "Zanele Mthembu", short: "Zanele M.", phone: "830001011", area: "cbd", service: "gardening", rateCents: 16000, rating: 4.6, reviewCount: 40, completed: 52, hue: 120, bio: "Garden clean-ups, lawn care and planting." }),
  vendor({ id: "u_tumi", name: "Tumi Mabena", short: "DJ Tumi", phone: "830001012", area: "cbd", service: "events", rateCents: 60000, rating: 4.8, reviewCount: 57, completed: 71, hue: 265, bio: "DJ for birthdays, weddings and corporate events. Own sound system." }),
  vendor({ id: "u_ayesha", name: "Ayesha Khan", short: "Ayesha K.", phone: "830001013", area: "sunnyside", service: "admin", rateCents: 21000, rating: 4.7, reviewCount: 33, completed: 45, hue: 180, bio: "Bookkeeping, SARS eFiling help and admin support." }),
  vendor({ id: "u_brandon", name: "Brandon Venter", short: "Brandon V.", phone: "830001014", area: "centurion", service: "locksmith", rateCents: 35000, rating: 4.8, reviewCount: 49, completed: 77, hue: 30, bio: "24-hour locksmith for lock-outs, lock changes, gate motors." }),
  vendor({ id: "u_grace", name: "Grace Nkosi", short: "Grace N.", phone: "830001015", area: "hatfield", service: "cleaning", rateCents: 14000, rating: 0, reviewCount: 0, completed: 0, hue: 5, bio: "New on NEXO®, home cleaning.", verification: { identity: "pending", address: "pending", skills: "unverified" }, joined: "2026" }),
  { id: "u_maya", name: "Maya Calloway", short: "Maya C.", initials: "MC", phone: "840002001", role: "requestor", area: "arcadia", hue: 210, simulated: true, status: "active", joined: "2025", rating: 4.8, reviewCount: 6, completed: 6 },
  { id: "u_pieter", name: "Pieter van der Merwe", short: "Pieter v.d.M.", initials: "PM", phone: "840002002", role: "requestor", area: "centurion", hue: 60, simulated: true, status: "active", joined: "2025", rating: 4.7, reviewCount: 4, completed: 4 },
  { id: "u_nandi", name: "Nandi Khumalo", short: "Nandi K.", initials: "NK", phone: "840002003", role: "requestor", area: "midrand", hue: 320, simulated: true, status: "active", joined: "2026", rating: 5, reviewCount: 2, completed: 2 },
];

export function createSeed(now = Date.now()): State {
  const t = (min: number) => now - min * MINUTE;
  const n = (days: number) => now - days * 24 * 60 * MINUTE;
  const users = structuredClone(SEED_USERS);
  const gigs: Gig[] = [];
  const bids: Bid[] = [];
  const messages: Message[] = [];
  const payments: Payment[] = [];
  const payouts: Payout[] = [];

  const history = (id: string, ref: string, requestorId: string, vendorId: string, service: string, title: string, area: string, cents: number, days: number, rating: number, text: string) => {
    const b = bidBreakdown(cents);
    gigs.push({
      id, ref, requestorId, vendorId, mode: "bid", service, title, description: title, photos: 0,
      budgetCents: cents, agreedCents: cents, timing: "this_week", area, address: defaultAddress(area),
      status: "completed", stage: "gig_completed", createdAt: n(days + 1), completedAt: n(days),
      settlement: { serviceCents: b.serviceCents, feeCents: b.serviceFeeCents, totalCents: b.requestorTotalCents, commissionCents: b.commissionCents, payoutCents: b.vendorPayoutCents },
      review: { rating, text, at: n(days) },
    });
    payments.push(
      { id: `p_${id}_f`, gigId: id, payerId: requestorId, kind: "service_fee", amountCents: SERVICE_FEE_CENTS, status: "captured", at: n(days + 1) },
      { id: `p_${id}_b`, gigId: id, payerId: requestorId, kind: "bid_amount", amountCents: cents, status: "captured", at: n(days) },
    );
    payouts.push({ id: `po_${id}`, vendorId, gigId: id, title, grossCents: cents, commissionCents: b.commissionCents, netCents: b.vendorPayoutCents, status: "paid", at: n(days) });
  };

  history("g_h1", "GIG-1031", "u_alex", "u_sarah", "painting", "Interior painting, lounge", "hatfield", 240000, 12, 5, "Beautiful finish and a spotless clean-up.");
  history("g_h2", "GIG-1027", "u_alex", "u_mia", "cleaning", "Deep clean, 2 bedroom flat", "hatfield", 45000, 20, 5, "Mia was thorough and friendly.");
  history("g_h3", "GIG-1019", "u_alex", "u_thabo", "plumbing", "Geyser pressure valve", "hatfield", 85000, 34, 4, "Fixed quickly, arrived a little late.");
  history("g_h4", "GIG-1012", "u_alex", "u_zanele", "gardening", "Garden clean-up", "hatfield", 60000, 48, 5, "Garden looks brand new.");
  history("g_h5", "GIG-1004", "u_alex", "u_kagiso", "moving", "Couch and fridge move", "hatfield", 90000, 63, 5, "Careful with everything. Great team.");
  history("g_j1", "GIG-1034", "u_maya", "u_john", "electrical", "Outlet repair", "arcadia", 70000, 9, 5, "Great work, very professional. Will use again!");
  history("g_j2", "GIG-1029", "u_pieter", "u_john", "electrical", "Lighting setup, patio", "centurion", 110000, 15, 5, "Neat installation, explained everything.");
  history("g_j3", "GIG-1022", "u_nandi", "u_john", "electrical", "DB board fault", "midrand", 130000, 26, 4, "Solved a tricky fault. Thanks John.");

  gigs.push({
    id: "g_active", ref: "GIG-1042", requestorId: "u_alex", vendorId: "u_john", mode: "bid", service: "electrical",
    title: "Electrical installation", description: "Need installation of a new DB board and rewiring of the kitchen circuit.",
    photos: 2, budgetCents: 150000, agreedCents: 150000, timing: "asap", area: "hatfield",
    address: "14 Burnett Street, Hatfield, Pretoria", addressReleasedAt: t(26), status: "traveling",
    createdAt: t(55), paidAt: t(26), travelStartedAt: t(4), etaMinutes: 12,
  });
  bids.push(
    { id: "b_act1", gigId: "g_active", vendorId: "u_john", amountCents: 150000, etaMinutes: 30, note: "Registered electrician, COC included.", status: "accepted", createdAt: t(48) },
    { id: "b_act2", gigId: "g_active", vendorId: "u_mike", amountCents: 160000, etaMinutes: 25, status: "rejected", createdAt: t(45) },
  );
  payments.push(
    { id: "p_act_f", gigId: "g_active", payerId: "u_alex", kind: "service_fee", amountCents: SERVICE_FEE_CENTS, status: "captured", at: t(26) },
    { id: "p_act_b", gigId: "g_active", payerId: "u_alex", kind: "bid_amount", amountCents: 150000, status: "authorized", at: t(26) },
  );
  messages.push(
    { id: "m1", gigId: "g_active", fromId: null, text: "John M. is booked. Payment is protected until service completion.", at: t(26) },
    { id: "m2", gigId: "g_active", fromId: "u_john", text: "Hi Alex! I've accepted your electrical installation gig.", at: t(25) },
    { id: "m3", gigId: "g_active", fromId: "u_alex", text: "Great, when can you arrive?", at: t(20) },
    { id: "m4", gigId: "g_active", fromId: "u_john", text: "Leaving now, I'll be there in about 12 minutes.", at: t(4) },
  );

  gigs.push({
    id: "g_bids", ref: "GIG-1044", requestorId: "u_alex", mode: "bid", service: "plumbing", title: "Leaking kitchen tap",
    description: "Kitchen mixer tap drips constantly and there is a small leak under the sink.", photos: 1,
    budgetCents: 65000, timing: "this_week", area: "hatfield", address: "14 Burnett Street, Hatfield, Pretoria",
    status: "bidding", createdAt: t(38),
  });
  bids.push(
    { id: "b_p1", gigId: "g_bids", vendorId: "u_thabo", amountCents: 60000, etaMinutes: 30, note: "I carry common mixer parts, likely a same-visit fix.", status: "pending", createdAt: t(31) },
    { id: "b_p2", gigId: "g_bids", vendorId: "u_bongani", amountCents: 55000, etaMinutes: 45, note: "Available this afternoon.", status: "pending", createdAt: t(22) },
  );

  const open = (id: string, ref: string, requestorId: string, title: string, description: string, area: string, budget: number, minAgo: number, timing: Gig["timing"]) =>
    gigs.push({ id, ref, requestorId, mode: "bid", service: "electrical", title, description, photos: 1, budgetCents: budget, timing, area, address: defaultAddress(area), status: "bidding", createdAt: t(minAgo) });
  open("g_o1", "GIG-1045", "u_maya", "DB board installation", "Replace an old DB board and add two new circuits for the kitchen.", "arcadia", 150000, 4, "asap");
  open("g_o2", "GIG-1043", "u_pieter", "Fix electrical fault", "Tripping earth leakage in the evenings, need fault finding.", "centurion", 85000, 22, "asap");
  open("g_o3", "GIG-1041", "u_nandi", "Install lights", "Install six LED downlights in the lounge and passage.", "midrand", 60000, 60, "flexible");

  payouts.push({ id: "po_old1", vendorId: "u_john", title: "Weekly payout, FNB •• 8821", grossCents: 320000, commissionCents: 0, netCents: -320000, status: "paid", at: n(7) });

  const notices: Notice[] = [
    { id: "n1", userId: "u_alex", title: "John M. is on the way", body: "ETA about 12 min.", href: "/app/#/gig/g_active", tone: "green", at: t(4), read: false },
    { id: "n2", userId: "u_alex", title: "New bid received", body: "Bongani K. bid on Leaking kitchen tap.", href: "/app/#/gig/g_bids", tone: "gold", at: t(22), read: false },
    { id: "n3", userId: "u_alex", title: "New bid received", body: "Thabo S. bid on Leaking kitchen tap.", href: "/app/#/gig/g_bids", tone: "gold", at: t(31), read: true },
    { id: "n4", userId: "u_alex", title: "Payment released to Sarah K.", body: "Interior painting, lounge", tone: "gold", at: n(12), read: true },
    { id: "n5", userId: "u_john", title: "New gig near you", body: "DB board installation · Arcadia", href: "/vendor/#/opportunity/g_o1", tone: "green", at: t(4), read: false },
    { id: "n6", userId: "u_john", title: "New 5-star review", body: "“Great work, very professional. Will use again!”", href: "/vendor/#/reviews", tone: "gold", at: n(9), read: true },
    { id: "n7", userId: "u_admin", title: "Verification waiting", body: "Grace N. submitted ID documents.", href: "/admin/#/verifications", tone: "gold", at: t(90), read: false },
  ];

  return {
    version: STATE_VERSION,
    seq: 1045,
    users,
    gigs,
    bids,
    messages,
    notices,
    payments,
    payouts,
    jobs: [],
    ads: [
      { id: "ad1", slot: "home_dashboard_bottom", impressions: 1284, clicks: 61 },
      { id: "ad2", slot: "provider_dashboard_bottom", impressions: 642, clicks: 24 },
      { id: "ad3", slot: "vendor_results_bottom", impressions: 905, clicks: 37 },
      { id: "ad4", slot: "gig_history_bottom", impressions: 311, clicks: 9 },
      { id: "ad5", slot: "notifications_bottom", impressions: 214, clicks: 6 },
    ],
  };
}
