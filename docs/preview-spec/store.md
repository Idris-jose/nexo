I've read all four bundles in full. I also checked `RequestorApp` and `VendorApp`, but only to see how the map and some helpers are used. Nothing was executed and no files were written.

One note on naming first. In `ui.DbJ6xcJi.js`, `y` is the **vendor-user factory**. The **progress-steps array** is `sn` in ui, exported as `aI` and imported into shared as `y`. Both are covered below.

---

# Part 1 — Demo data store (`/tmp/nexo-dl.DzJu/ui.DbJ6xcJi.js`)

## 1.1 Constants
| min | value | meaning |
|---|---|---|
| `z` | `2000` | service fee in cents (R20), non-refundable, charged to the requestor |
| `it` | `300` | commission in basis points (3%) |
| `ke` | `15` | billing increment in minutes |
| `rt` | `60` | minimum billable minutes |
| `Ce` | `30` | vendor match radius in km |
| `st` | `.5` | distance rounding step in km |
| `O` | `{ttlSeconds:600, maxAttempts:5, maxResends:3}` | OTP policy |
| `en` | `{paymentProtection:"Payment protected until service completion."}` | copy |
| `K` | `5` | state schema version |
| `oe` | `"gig.demo.state"` | localStorage key for the whole state (JSON) |
| `Z` | `"gig.demo.session"` | localStorage key holding the logged-in user id |
| `ne` | `6e4` | 1 minute in ms |
| `an` | `"123456"` | demo login OTP |
| sessionStorage | `"gig.demo.reloaded"` | one-shot reload guard |

## 1.2 Money math (all integer cents)
- `U(e,label)` throws `RangeError("<label> must be a non-negative integer number of cents (got X)")`.
- `ot(amount,bps) = Math.floor((amount*bps + 5000)/10000)`, which rounds half up. Bad bps throws `"bps must be a non-negative integer (got X)"`.
- `Ie(c) = ot(c, 300)` gives the commission.
- **Bid gig, `se(bid)`** returns `{serviceCents: bid, serviceFeeCents: 2000, requestorTotalCents: bid+2000, commissionCents: Ie(bid), vendorPayoutCents: bid - Ie(bid)}`.
- **Billable minutes, `ct(actual)`** = `max(60, ceil(actual/15)*15)`. Throws `"actualMinutes must be a non-negative number (got X)"`.
- **Pro-rata, `lt(rate,min)`** = `floor((rate*min + 30)/60)`. Throws `"minutes must be a non-negative integer (got X)"`.
- **Instant/hourly, `ut(rate, actualMinutes)`** returns `{hourlyRateCents, actualMinutes, billableMinutes, serviceCents: lt(rate,billable), firstHourCents: rate, remainingCents: service - rate, serviceFeeCents: 2000, requestorTotalCents: service+2000, commissionCents: Ie(service), vendorPayoutCents: service - commission}`.
- **Instant booking upfront, `mt(rate)`** returns `{serviceFeeCents: 2000, firstHourCents: rate, totalCents: 2000+rate}`.
- **Format, `dt(cents, {alwaysShowCents})`**:
  - Output is `"R" + U+00A0 + rands`, with thousands grouped by U+00A0.
  - `",NN"` is appended only if there are cents or `alwaysShowCents` is set.
  - Negative values get a leading `-`. The input is `Math.round`ed first.
  - Examples: `150000` gives `R 1 500`; `2050` gives `R 20,50`.

## 1.3 Geography
- **Haversine** `gt`, with Earth radius 6371 km.
- **`ht(km, step=.5)`** = `max(.5, round(km/.5)*.5)`.
- **`L(areaA, areaB)`** gives the rounded km between two area keys.

**Areas `R`** (key: suburb, city, lat, lng; province is always "Gauteng"):

| key | suburb | city | lat | lng |
|---|---|---|---|---|
| hatfield | Hatfield | Pretoria | -25.7487 | 28.238 |
| arcadia | Arcadia | Pretoria | -25.7445 | 28.2105 |
| sunnyside | Sunnyside | Pretoria | -25.756 | 28.205 |
| brooklyn | Brooklyn | Pretoria | -25.771 | 28.238 |
| menlopark | Menlo Park | Pretoria | -25.77 | 28.258 |
| waterkloof | Waterkloof | Pretoria | -25.78 | 28.248 |
| garsfontein | Garsfontein | Pretoria | -25.792 | 28.294 |
| cbd | Pretoria Central | Pretoria | -25.7461 | 28.1881 |
| montana | Montana | Pretoria | -25.678 | 28.254 |
| lyttelton | Lyttelton | Centurion | -25.834 | 28.208 |
| centurion | Centurion Central | Centurion | -25.8603 | 28.1894 |
| midrand | Midrand | Midrand | -25.999 | 28.126 |

`nn = Object.keys(R)` is the list of area keys.

**Default addresses `_e`:**
- arcadia: `"22 Park Street, Arcadia, Pretoria"`
- centurion: `"8 Jean Avenue, Centurion"`
- midrand: `"41 New Road, Midrand"`
- hatfield: `"14 Burnett Street, Hatfield, Pretoria"`
- any other area: `` `12 Main Road, ${suburb}` ``

## 1.4 Services `Ft` (all fields verbatim, in order)
| slug | name | trade | category | icon | blurb | typicalCents |
|---|---|---|---|---|---|---|
| electrical | Electrical | Electrician | technical-services | zap | DB boards, faults, lights, plugs and COCs. | 120000 |
| plumbing | Plumbing | Plumber | home-services | droplets | Leaks, geysers, blocked drains and fittings. | 80000 |
| cleaning | Cleaning | Cleaner | home-services | sparkles | Deep cleans, move-out cleans and regular help. | 50000 |
| painting | Painting | Painter | home-services | paintbrush | Interior and exterior painting, touch-ups. | 180000 |
| moving | Moving | Mover | logistics-services | truck | Furniture moves, deliveries and collections. | 90000 |
| repairs | Repairs | Handyman | home-services | hammer | Doors, shelves, fittings and odd jobs. | 60000 |
| gardening | Gardening | Gardener | home-services | sprout | Garden clean-ups, lawns and planting. | 45000 |
| tutoring | Tutoring | Tutor | education-services | graduation-cap | Maths, science and exam prep, at home or online. | 40000 |
| massage | Massage | Massage therapist | wellness-services | hand-heart | Relaxation and sports massage at home. | 60000 |
| events | DJ & Events | DJ | leisure-entertainment | music | DJs and event help for parties and functions. | 250000 |
| admin | Admin Support | Admin assistant | administrative-services | clipboard-list | Bookkeeping, filing and paperwork. | 70000 |
| locksmith | Locksmith | Locksmith | specialised-services | key-round | Lock-outs, lock changes and security gates. | 65000 |

Helpers:
- `Ke(slug)` finds a service by slug.
- `Kn(slug)` returns the service name, or the slug if not found.
- **Icon map `Wt`:** zap, droplets, sparkles, paintbrush, truck, hammer, sprout, graduation-cap, hand-heart, music, clipboard-list, key-round, house, wrench. The fallback is `wrench`.

## 1.5 Other constants
- **Progress stages `sn`** (imported into shared as `y`), in order:
  1. `arrival_at_location` / "Arrival at Location"
  2. `inspection` / "Inspection"
  3. `gig` / "Gig"
  4. `gig_completed` / "Gig Completed"
- **Timing labels `on`:** `{asap:"ASAP", this_week:"This week", flexible:"Flexible"}`
- **Demo login accounts `rn`:**
  - `u_alex` — "Service Requestor", phone "82 123 4567", "Post gigs, compare bids, book vendors, pay and review."
  - `u_john` — "Vendor (Electrician)", phone "82 555 0142", "Go online, bid on nearby gigs, do the job, get paid."
  - `u_admin` — "Admin", phone "82 000 0001", "Platform overview, verifications, gigs and payments."

## 1.6 Users (seed `Ht`)

**Vendor factory `y(e)`.** It fills these defaults, then spreads `e` on top:
- `initials`: computed from `short` by removing ".", splitting on spaces, and taking the first letters in upper case. "John M." gives "JM"; "DJ Tumi" gives "DT".
- `role:"vendor"`, `simulated:true`, `status:"active"`, `joined:"2025"`, `responseRate:96`, `online:true`
- `verification:{identity:"verified", address:"verified", skills:"verified"}`
- `certifications:[]`, `lifetimeCents:0`, `walletCents:0`

**Non-vendor users:**

| id | name | short | initials | phone | role | area | hue | simulated | joined | rating | reviewCount | completed | extra |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| u_alex | Alex Thompson | Alex T. | AT | 821234567 | requestor | hatfield | 24 | false | 2025 | 4.9 | 11 | 5 | `saved:["u_john","u_sarah","u_thabo","u_mia"]`, status active |
| u_admin | Thandi Mahlangu | Thandi M. | TM | 820000001 | admin | cbd | 280 | false | 2024 | 0 | 0 | 0 | status active |
| u_maya | Maya Calloway | Maya C. | MC | 840002001 | requestor | arcadia | 210 | true | 2025 | 4.8 | 6 | 6 | |
| u_pieter | Pieter van der Merwe | Pieter v.d.M. | PM | 840002002 | requestor | centurion | 60 | true | 2025 | 4.7 | 4 | 4 | |
| u_nandi | Nandi Khumalo | Nandi K. | NK | 840002003 | requestor | midrand | 320 | true | 2026 | 5 | 2 | 2 | |

**Vendors** (built with `y`). The seed array order is: alex, john, admin, sarah, thabo, mia, mike, bongani, sipho, kagiso, lerato, naledi, zanele, tumi, ayesha, brandon, grace, maya, pieter, nandi.

| id | name | short | phone | area | service | rateCents | rating | reviews | completed | hue | bio / overrides |
|---|---|---|---|---|---|---|---|---|---|---|---|
| u_john | John Mokoena | John M. | 825550142 | lyttelton | electrical | 25000 | 4.8 | 120 | 18 | 145 | `simulated:false`, `responseRate:98`, `joined:"2024"`, `lifetimeCents:1245000`, `walletCents:874000`, certifications `["Wireman’s Licence","Certificate of Compliance (COC) issuer"]`. Bio: "Registered electrician with 9 years of residential experience. DB boards, fault finding, lighting and certificates of compliance." |
| u_sarah | Sarah Khumalo | Sarah K. | 830001002 | brooklyn | painting | 18000 | 4.9 | 180 | 301 | 330 | "Interior and exterior painting. Clean lines, tidy sites, fair quotes." |
| u_thabo | Thabo Sithole | Thabo S. | 830001003 | sunnyside | plumbing | 20000 | 4.7 | 95 | 167 | 205 | "Plumber specialising in geysers, leaks and blocked drains." |
| u_mia | Mia Dlamini | Mia D. | 830001004 | menlopark | cleaning | 15000 | 4.8 | 142 | 210 | 12 | "Deep cleans and move-out cleans. I bring my own supplies." |
| u_mike | Mike Davids | Mike D. | 830001005 | centurion | electrical | 23000 | 4.6 | 58 | 98 | 190 | "Electrician — lighting, plugs and fault finding." |
| u_bongani | Bongani Khoza | Bongani K. | 830001006 | arcadia | plumbing | 21000 | 4.6 | 44 | 61 | 260 | "Quick-response plumber for leaks and burst pipes." |
| u_sipho | Sipho Ndlovu | Sipho N. | 830001007 | arcadia | repairs | 19000 | 4.7 | 76 | 130 | 95 | "Handyman — doors, shelving, fittings and small repairs." |
| u_kagiso | Kagiso Letsholo | Kagiso L. | 830001008 | montana | moving | 32000 | 4.7 | 64 | 88 | 40 | "1-ton bakkie and two helpers for moves and deliveries." |
| u_lerato | Lerato Phiri | Lerato P. | 830001009 | garsfontein | tutoring | 22000 | 4.9 | 88 | 143 | 300 | "Maths and Physical Science tutor, Grades 8–12." |
| u_naledi | Naledi Radebe | Naledi R. | 830001010 | waterkloof | massage | 40000 | 4.9 | 131 | 190 | 350 | "Qualified massage therapist — relaxation and sports massage." |
| u_zanele | Zanele Mthembu | Zanele M. | 830001011 | cbd | gardening | 16000 | 4.6 | 40 | 52 | 120 | "Garden clean-ups, lawn care and planting." |
| u_tumi | Tumi Mabena | DJ Tumi | 830001012 | cbd | events | 60000 | 4.8 | 57 | 71 | 265 | "DJ for birthdays, weddings and corporate events. Own sound system." |
| u_ayesha | Ayesha Khan | Ayesha K. | 830001013 | sunnyside | admin | 21000 | 4.7 | 33 | 45 | 180 | "Bookkeeping, SARS eFiling help and admin support." |
| u_brandon | Brandon Venter | Brandon V. | 830001014 | centurion | locksmith | 35000 | 4.8 | 49 | 77 | 30 | "24-hour locksmith — lock-outs, lock changes, gate motors." |
| u_grace | Grace Nkosi | Grace N. | 830001015 | hatfield | cleaning | 14000 | 0 | 0 | 0 | 5 | "New on Nexo — home cleaning." with `verification:{identity:"pending",address:"pending",skills:"unverified"}` and `joined:"2026"` |

## 1.7 Seed state `ie()`
Times are relative to `now`. `t(min)` means `now - min minutes`; `n(days)` means `now - days`.

**Top-level shape:**
```
{version:5, seq:1045, users, gigs, bids, messages, notices, payments, payouts, jobs:[], ads:[...]}
```

**History gigs**, created by helper `u(id, ref, requestor, vendor, service, title, area, cents, daysAgo, rating, reviewText)`. Each one has:
- `mode:"bid"`, `description = title`, `photos:0`, `budgetCents = agreedCents = cents`, `timing:"this_week"`, address from `_e`
- `status:"completed"`, `stage:"gig_completed"`, `createdAt: n(days+1)`, `completedAt: n(days)`
- `settlement` from `se()`: `{serviceCents, feeCents, totalCents, commissionCents, payoutCents}`
- `review:{rating, text, at: n(days)}`

Each one also pushes:
- payments `p_<id>_f` (service_fee 2000, captured, at `n(d+1)`) and `p_<id>_b` (bid_amount, captured, at `n(d)`)
- payout `po_<id>` `{vendorId, gigId, title, grossCents, commissionCents, netCents, status:"paid", at: n(d)}`

| id | ref | requestor | vendor | service | title | area | cents | daysAgo | rating | review |
|---|---|---|---|---|---|---|---|---|---|---|
| g_h1 | GIG-1031 | u_alex | u_sarah | painting | Interior painting — lounge | hatfield | 240000 | 12 | 5 | Beautiful finish and a spotless clean-up. |
| g_h2 | GIG-1027 | u_alex | u_mia | cleaning | Deep clean — 2 bedroom flat | hatfield | 45000 | 20 | 5 | Mia was thorough and friendly. |
| g_h3 | GIG-1019 | u_alex | u_thabo | plumbing | Geyser pressure valve | hatfield | 85000 | 34 | 4 | Fixed quickly, arrived a little late. |
| g_h4 | GIG-1012 | u_alex | u_zanele | gardening | Garden clean-up | hatfield | 60000 | 48 | 5 | Garden looks brand new. |
| g_h5 | GIG-1004 | u_alex | u_kagiso | moving | Couch and fridge move | hatfield | 90000 | 63 | 5 | Careful with everything. Great team. |
| g_j1 | GIG-1034 | u_maya | u_john | electrical | Outlet repair | arcadia | 70000 | 9 | 5 | Great work, very professional. Will use again! |
| g_j2 | GIG-1029 | u_pieter | u_john | electrical | Lighting setup — patio | centurion | 110000 | 15 | 5 | Neat installation, explained everything. |
| g_j3 | GIG-1022 | u_nandi | u_john | electrical | DB board fault | midrand | 130000 | 26 | 4 | Solved a tricky fault. Thanks John. |

**Active gig `g_active`:**
```
{id:"g_active", ref:"GIG-1042", requestorId:"u_alex", vendorId:"u_john", mode:"bid",
 service:"electrical", title:"Electrical installation",
 description:"Need installation of a new DB board and rewiring of the kitchen circuit.",
 photos:2, budgetCents:150000, agreedCents:150000, timing:"asap", area:"hatfield",
 address:"14 Burnett Street, Hatfield, Pretoria", addressReleasedAt:t(26),
 status:"traveling", createdAt:t(55), paidAt:t(26), travelStartedAt:t(4), etaMinutes:12}
```
- Bids:
  - `b_act1`: u_john, 150000, eta 30, note "Registered electrician, COC included.", accepted, `t(48)`
  - `b_act2`: u_mike, 160000, eta 25, no note, rejected, `t(45)`
- Payments:
  - `p_act_f`: service_fee 2000, captured, `t(26)`
  - `p_act_b`: bid_amount 150000, **authorized**, `t(26)`
- Messages:
  - `m1` (system, `fromId:null`, `t(26)`): "John M. is booked. Payment is protected until service completion."
  - `m2` (u_john, `t(25)`): "Hi Alex! I've accepted your electrical installation gig."
  - `m3` (u_alex, `t(20)`): "Great — when can you arrive?"
  - `m4` (u_john, `t(4)`): "Leaving now, I'll be there in about 12 minutes."

**Bidding gig `g_bids`:**
- GIG-1044, u_alex, plumbing, "Leaking kitchen tap"
- Description: "Kitchen mixer tap drips constantly and there is a small leak under the sink."
- `photos:1`, `budgetCents:65000`, `timing:"this_week"`, hatfield, "14 Burnett Street, Hatfield, Pretoria", `status:"bidding"`, `createdAt:t(38)`
- Bids:
  - `b_p1`: u_thabo, 60000, eta 30, "I carry common mixer parts, likely a same-visit fix.", pending, `t(31)`
  - `b_p2`: u_bongani, 55000, eta 45, "Available this afternoon.", pending, `t(22)`

**Open electrical gigs for John**, created by helper `g`. Each has `service:"electrical"`, `photos:1`, `status:"bidding"`, `mode:"bid"` and an address from `_e`:
- `g_o1`: GIG-1045, u_maya, "DB board installation", "Replace an old DB board and add two new circuits for the kitchen.", arcadia, 150000, `t(4)`, asap
- `g_o2`: GIG-1043, u_pieter, "Fix electrical fault", "Tripping earth leakage in the evenings — need fault finding.", centurion, 85000, `t(22)`, asap
- `g_o3`: GIG-1041, u_nandi, "Install lights", "Install six LED downlights in the lounge and passage.", midrand, 60000, `t(60)`, flexible

Extra payout: `po_old1`, u_john, "Weekly payout — FNB •• 8821", gross 320000, commission 0, net -320000, paid, `n(7)`.

**Notices (seed):**

| id | user | title | body | href | tone | at | read |
|---|---|---|---|---|---|---|---|
| n1 | u_alex | John M. is on the way | ETA about 12 min. | /app/#/gig/g_active | green | t(4) | false |
| n2 | u_alex | New bid received | Bongani K. bid on Leaking kitchen tap. | /app/#/gig/g_bids | gold | t(22) | false |
| n3 | u_alex | New bid received | Thabo S. bid on Leaking kitchen tap. | /app/#/gig/g_bids | gold | t(31) | true |
| n4 | u_alex | Payment released to Sarah K. | Interior painting — lounge | (none) | gold | n(12) | true |
| n5 | u_john | New gig near you | DB board installation · Arcadia | /vendor/#/opportunity/g_o1 | green | t(4) | false |
| n6 | u_john | New 5-star review | “Great work, very professional. Will use again!” | /vendor/#/reviews | gold | n(9) | true |
| n7 | u_admin | Verification waiting | Grace N. submitted ID documents. | /admin/#/verifications | gold | t(90) | false |

**Ads:**

| id | slot | impressions | clicks |
|---|---|---|---|
| ad1 | home_dashboard_bottom | 1284 | 61 |
| ad2 | provider_dashboard_bottom | 642 | 24 |
| ad3 | vendor_results_bottom | 905 | 37 |
| ad4 | gig_history_bottom | 311 | 9 |
| ad5 | notifications_bottom | 214 | 6 |

## 1.8 Entity shapes (inferred)
- **Gig**:
  - Identity and parties: `id`, `ref` ("GIG-n"), `requestorId`, `vendorId?`, `mode` ("bid" or "instant"), `service`, `title`, `description`, `photos`, `area`, `address`
  - Money: `budgetCents?`, `agreedCents?`, `hourlyRateCents?` (instant only), `selectedBidId?`, `actualMinutes?`
  - Progress: `timing`, `status`, `stage?`, `etaMinutes?`
  - OTPs: `startOtp?` and `completionOtp?`, each `{code, expiresAt, attempts, resends}`
  - Timestamps: `createdAt`, `addressReleasedAt?`, `paidAt?`, `travelStartedAt?`, `arrivedAt?`, `startedAt?`, `completeMarkedAt?`, `completedAt?`, `cancelledAt?`
  - Outcome: `settlement?` `{serviceCents, feeCents, totalCents, commissionCents, payoutCents, billableMinutes?, firstHourCents?, remainingCents?}` and `review?` `{rating, text, at}`
- **Bid**: `{id, gigId, vendorId, amountCents, etaMinutes, note?, status, createdAt}`. Status is one of pending, accepted, rejected, withdrawn.
- **Message**: `{id, gigId, fromId (null = system), text, at}`
- **Notice**: `{id, userId, title, body?, href?, tone (green|gold|gray), at, read}`
- **Payment**: `{id, gigId, payerId, kind, amountCents, status, at}`. Kind is one of service_fee, bid_amount, first_hour, remaining_hours. Status is captured or authorized.
- **Payout**: `{id, vendorId, gigId?, title, grossCents, commissionCents, netCents, status (paid|processing), at}`
- **Job** (scheduled simulation step): `{id, kind, gigId, due, data?}`

**Gig status enum:**
`bidding` → `vendor_selected` (instant only) → `payment_pending` → `accepted` → `traveling` → `start_verification` → `active` (stage `inspection`, then `gig`) → `completion_verification` → `completed`. Separately: `cancelled`.

Status groups:
- `Hn` (active): accepted, traveling, start_verification, active, completion_verification
- `Vn` (open): bidding, vendor_selected, payment_pending

## 1.9 Persistence and sync
- **`P()` (getSnapshot):**
  - Reads `localStorage["gig.demo.state"]`. If localStorage throws, it falls back to an in-memory string `Ue`.
  - It caches by raw string (`F` = string, `E` = object), so the same string returns the same object (needed for `useSyncExternalStore`).
  - If the stored version equals 5, it uses it.
  - If the stored version is greater than 5 (a newer tab exists), it reloads the page once, guarded by `sessionStorage "gig.demo.reloaded"="1"`, and returns the cache or a fresh seed.
  - On a parse error, lower version, or missing value, it seeds with `ie()` and writes that.
- **`m(fn)` (mutate):**
  - Aborts if the stored version is greater than 5.
  - Otherwise it `structuredClone`s the current state, runs `fn(draft)`, `JSON.stringify`s it, writes it to localStorage, updates the cache and notifies listeners.
- **Subscription:** a listener `Set`. `Ye(cb)` subscribes.
  - `dn()` = `useSyncExternalStore(sub, P, P)` returns the whole state (exported as `u` / `useStore`).
  - `Vt(selector)` is the selector variant.
- **Cross-tab/iframe sync:** `window.addEventListener("storage")`. If `e.key` is the state key, the session key, or `null` (clear), all listeners are notified and re-read from localStorage. There is no polling for state. There is a 1 s ticker (see 1.11) that only processes due jobs.
- **`cn()` (reset):** writes a fresh `ie()` seed and notifies listeners.

**Session:**
- `Qe()` (exported `r`, used as `D()` in shared) returns `?as=<userId>` from `location.search` if present, which takes priority. Otherwise it reads `localStorage["gig.demo.session"]`. On the server it returns null.
  - This means a phone-preview iframe like `/vendor/?as=u_john` renders as that user **without touching the shared session key**.
- `ln(id)` logs in by setting the session key and notifying.
- `un()` logs out by removing the key and notifying.
- `mn()` = `useCurrentUser`, which returns the user matching `Qe()`, or null.
- `pn(role)` gives the home path: `"/vendor/"`, `"/admin/"`, or `"/app/"`.

**Other helpers:**
- ID generator `w(prefix)` = `` `${prefix}_${Math.random().toString(36).slice(2,9)}` ``. Prefixes used: g, b, m, n, p, po, j, u.
- OTP `ce()` = `crypto.getRandomValues(Uint32Array(1))[0] % 1e6`, zero-padded to 6 digits.
- Link helper `_(gig, role)`: requestor gets `/app/#/gig/<id>`, vendor gets `/vendor/#/job/<id>`.
- `h(state, userId, title, body, href, tone="green")` adds a notice with `unshift` (newest first) and `read:false`.
- `T(state, gigId, text)` adds a system message (`fromId:null`).
- `C(state, kind, gigId, delayMs, data)` schedules a job, skipping it if an identical kind+gigId+data job already exists.

**Eligibility:**
- `le(state, vendor, gig)`: role is vendor, status is active, `service === gig.service`, identity is verified, `online` is true, distance ≤ 30 km, and the vendor is not the requestor.
- `gn(state, service, area)`: active, verified vendors of that service within 30 km (online not required), mapped to `{vendor, km}`. Sorted online first, then by km ascending.

## 1.10 Simulation scheduler `I(state, gig)` (runs after most transitions)
"sim vendor" and "sim requestor" mean that user has `simulated` set to true.

| status | condition | job | delay |
|---|---|---|---|
| vendor_selected | sim vendor | vendor_accept | 5 s |
| payment_pending | sim requestor | requestor_pay | 4 s |
| accepted | sim vendor | vendor_start_travel | 4 s |
| traveling | sim vendor | vendor_arrive | 10 s |
| start_verification | sim requestor | requestor_share_code | 3.5 s |
| start_verification | sim vendor | vendor_enter_start | 12 s |
| active | sim vendor | `vendor_stage` if stage is inspection, else `vendor_complete` (data `{stage}`) | 7 s |
| completion_verification | sim vendor | vendor_share_code | 2.5 s |
| completion_verification | sim requestor | requestor_verify_completion | 8 s |
| completed | sim requestor, no review yet | requestor_review | 5 s |

## 1.11 Ticker `Bn()` (exported `aC`)
- AppShell runs it once on mount and then every 1000 ms with `setInterval`.
- If any job has `due <= now`, it runs a mutation that removes all due jobs and executes them in `due` order via `W(state, job)`.
- Because state lives in localStorage, whichever tab or iframe ticks first executes the job, and the rest sync through the storage event.

**Job handlers `W`:**
- **auto_bid**: needs vendor `data.vendorId`, gig still bidding, and `budgetCents` set.
  - Amount = `round(budget * factor / 1000) * 1000`, i.e. rounded to R10.
  - ETA = `max(15, round(km*4) + 10)`.
  - Note is chosen at random from:
    - "Available today — I can bring all materials."
    - "Happy to help, I have done this type of job many times."
    - "Can start as soon as you confirm."
  - Then calls `et` (placeBid).
- **vendor_accept** → `pe`; **vendor_start_travel** → `ge`; **vendor_arrive** → `he`.
- **vendor_enter_start** → `fe(gig, startOtp.code)`.
- **vendor_stage** → `ve`.
- **vendor_complete** → `be(gig, mode==="instant" ? 150 : undefined)`.
- **vendor_share_code**: if the gig is in completion_verification, it pushes a message from the vendor: `` `All done! My completion code is ${code}.` ``. It also notifies the requestor: `` `${vendor.short} sent the completion code` `` / "Open the gig to verify completion." (gold, links to the requestor gig).
- **requestor_accept_bid** (data bidId): if the bid is pending and the gig is bidding, it sets selectedBidId, vendorId, agreedCents and `status="payment_pending"`, then calls `H` (pay), so it accepts and pays at once.
- **requestor_pay** → `H`.
- **requestor_share_code**: if the gig is in start_verification, it pushes a message from the requestor: `` `Hi! My start code is ${code}.` ``. It notifies the vendor: `` `${req.short} sent the start code` `` / `` `Code: ${code}` `` (gold, vendor job link).
- **requestor_verify_completion** → `ue(gig, completionOtp.code)`.
- **requestor_review** → `me(gig, 5, random)`, picking from:
  - "Professional, on time and tidy. Highly recommend."
  - "Great work — will book again."
  - "Friendly and efficient. Thank you!"

## 1.12 Actions (export alias → internal)

**`$` postGig, `hn(requestorId, fields)`:**
- Creates `{id, ref:"GIG-"+(++seq), requestorId, mode:"bid", ...fields, status:"bidding", createdAt}` with `unshift`.
- Eligible vendors (via `le`) each get a notice "New gig near you" / `` `${title} · ${suburb} · ${km} km` `` linking to `/vendor/#/opportunity/<id>` (green).
- The first 2 simulated eligible vendors get an auto_bid at 5 s (factor .94) and 13 s (factor 1.03).
- The requestor gets "Your gig is live" / `` `${n} verified ${n===1?"vendor":"vendors"} nearby can bid.` `` linking to `/app/#/gig/<id>`.
- Returns the gig id.

**`a2` instantBook, `fn(requestorId, vendorId, fields)`:**
- Throws "Vendor not found" if the vendor has no `rateCents`.
- Creates a gig with `mode:"instant"`, `vendorId`, `hourlyRateCents` = vendor rate, `status:"vendor_selected"`.
- Notifies the vendor "New instant request" / `` `${title} · ${suburb}` `` (gold), then calls `I`.
- Returns the id.

**`a7` selectBid, `vn(bidId)`:**
- Requires a pending bid and a bidding gig.
- Sets selectedBidId, vendorId, agreedCents and `status="payment_pending"`, then calls `I`.

**`ad` unselectBid, `bn(gigId)`:** if `payment_pending` and mode bid, it reverts to bidding and clears selectedBidId, vendorId and agreedCents.

**`af` confirmPayment, `yn` → `H(state, gigId)`:**
- Requires `payment_pending` and a vendorId.
- **Bid mode:**
  - Payments: service_fee 2000 **captured**, and bid_amount `serviceCents` **authorized** (escrow).
  - The selected bid becomes accepted. Other pending bids become rejected, and each of those vendors gets "Bid not selected" / `` `${title} went to another vendor.` `` (no href, gray).
- **Instant mode:** service_fee 2000 captured, and first_hour = hourly rate authorized.
- Then: `status="accepted"`, `paidAt = addressReleasedAt = now`.
- System message: `` `${vendor.short} is booked. Payment is protected until service completion.` ``
- Vendor notice: "You won the bid!" (bid) or "Booking confirmed" (instant), body `` `${req.short} confirmed ${title}. The exact address is now available.` ``
- Requestor notice: "Booking confirmed" / `` `${vendor.short} will head over soon.` ``
- Then calls `I`.

**`ay` placeBid, `Cn(vendorId, gigId, amountCents, etaMinutes, note)` → `et`:**
- Requires a bidding gig and an eligible vendor.
- If the vendor already has a pending bid on this gig, it updates amount, eta and note silently.
- Otherwise it pushes a new pending bid and notifies the requestor "New bid received" / `` `${vendor.short} bid on ${title}.` `` (gold).
- If the requestor is simulated, it schedules requestor_accept_bid in 8 s.

**`aq` withdrawBid, `In(bidId)`:** pending becomes withdrawn.

**`am` vendorAccept, `jn` → `pe`:**
- Requires `vendor_selected`, then moves to `payment_pending`.
- Requestor notice: `` `${vendor.short} accepted your request` `` / "Confirm payment to book them." (gold). Then calls `I`.

**`an` vendorDecline, `Mn`:**
- `vendor_selected` becomes cancelled, with `cancelledAt` set.
- Requestor notice: "Vendor unavailable" / `` `${vendor.short} can't take ${title}. Try another vendor.` `` linking to `/app/#/find` (gray).

**`a5` cancelGig, `wn(gigId)`:**
- Only allowed in bidding, vendor_selected or payment_pending.
- Moves to cancelled with `cancelledAt` set. Pending bids become rejected, and the gig's jobs are removed.
- If a vendor is set, they get "Request cancelled" / title (gray).

**`av` startTravel, `Sn` → `ge`:**
- Requires `accepted`, then moves to `traveling` with `travelStartedAt` set.
- `etaMinutes = max(6, round(km(vendor.area, gig.area) * 2.2))`.
- Requestor notice: `` `${vendor.short} is on the way` `` / `` `ETA about ${eta} min.` ``

**`au` arrive, `Nn` → `he`:**
- Requires `traveling`, then moves to `start_verification` with `stage="arrival_at_location"` and `arrivedAt` set.
- Creates `startOtp={code, expiresAt: now+600 s, attempts:0, resends:0}`.
- Requestor notice: `` `${vendor.short} has arrived` `` / "Share your start code to begin the job."
- System message: `` `${vendor.short} has arrived. Start code sent to the service requestor.` ``

**`at` verifyStart, `An(gigId, code)` → `fe`:**
- Returns `{ok, error?}`. If the gig isn't waiting: "This gig is not waiting for a start code."
- Shared OTP check `Xe` (errors are checked in this order):
  1. Expired: "This code has expired. Ask for a new one."
  2. `attempts >= 5`: "Too many attempts. Request a new code."
  3. Mismatch: attempts += 1, then `` `That code doesn't match. ${left} ${left===1?"try":"tries"} left.` ``, or "Too many attempts. Request a new code." when 0 are left.
- On success: `status="active"`, `stage="inspection"`, `startedAt` set.
- Requestor notice: "Gig started" / "Start code verified."
- System message: "Start code verified. The gig has started."

**`aa` resendCode, `$n(gigId, "start"|"completion")`:**
- With no OTP: "No code to resend."
- If `resends >= 3`: "Resend limit reached. Contact support."
- Otherwise it issues a new code (TTL reset, attempts 0, resends+1) and calls `I`.

**`ar` finishInspection, `Dn` → `ve`:** requires active with stage inspection. Sets `stage="gig"` and adds the system message "Inspection done. Work in progress."

**`as` markComplete, `En(gigId, minutes?)` → `be`:**
- Requires active with stage gig.
- Moves to `completion_verification` with `completeMarkedAt` set.
- Instant mode: `actualMinutes = minutes ?? max(60, round((now-startedAt)/60000))`.
- Creates `completionOtp`.
- Requestor notice: `` `${vendor.short} marked the gig complete` `` / "Enter the completion code from your vendor to release payment." (gold).
- System message: "Vendor marked the gig complete. Completion code sent to the vendor."

**`ae` verifyCompletion, `xn(gigId, code)` → `ue`:**
- If the gig isn't waiting: "This gig is not waiting for completion." Then the same `Xe` check.
- On success, `Jt` settles the gig:
  - **Bid mode:** settlement comes from `se(agreed)`, and bid_amount payments become captured.
  - **Instant mode:** settlement comes from `ut(rate, actualMinutes ?? 60)` and includes billableMinutes, firstHourCents and remainingCents. first_hour becomes captured. If remaining > 0, a captured `remaining_hours` payment is pushed.
  - Then: `status="completed"`, `stage="gig_completed"`, `completedAt` set.
  - Vendor: `completed += 1`, and `lifetimeCents` and `walletCents` each go up by the payout. Requestor: `completed += 1`.
  - Payout `po_*` `{gross: serviceCents, commission, net: payout, status:"paid"}` is added with `unshift`.
  - System message: "Completion verified. Payment released to the vendor."
  - Vendor notice: "Payment released" / `` `${title} · you received your payout.` `` (gold).
  - Requestor notice: "Gig completed" / `` `Rate ${vendor.short} to help the community.` ``
  - Then calls `I`.

**`ab` review, `kn(gigId, rating, text)` → `me`:**
- Requires completed with no existing review. Sets the review.
- Vendor rating = `round((rating*count + r)/(count+1) * 10)/10`, and `count += 1`.
- Vendor notice: `` `New ${r}-star review` `` / (text, or undefined) linking to `/vendor/#/reviews` (gold).

**`Z` toggleSaved, `_n(userId, vendorId)`:** toggles membership in `user.saved`.

**`al` setOnline, `qn(userId, bool)`:** sets `online`.

**`ax` withdraw, `Gn(vendorId)`:**
- If the wallet is above 0, it adds a payout "Withdrawal to FNB •• 8821" with `gross = wallet`, `net = -wallet`, `status:"processing"`, and sets the wallet to 0.
- Notice: "Withdrawal requested" / "Funds usually reflect within 1–2 business days." linking to `/vendor/#/earnings` (gray).

**`aH` sendMessage, `Rn(gigId, fromId, text)`:**
- Pushes the message with text trimmed.
- The other party gets `` `Message from ${sender.short}` `` with body `text.slice(0,80)`. The href is `/app/#/messages/<gig>` for the requestor or `/vendor/#/messages/<gig>` for the vendor. Tone gray.

**`aD` markAllRead, `zn(userId)`.**

**`aE` trackAd, `On(slot, "impressions"|"clicks")`:** increments the counter.

**`o` setVerification, `Pn(userId, status)`:**
- Sets all three verification fields to `status`.
- Notice: "You are verified" (green) or "Verification unsuccessful" (gray), no body, linking to `/vendor/#/profile`.

**`k` setUserStatus, `Ln(userId, status)`:** has no effect on admins.

**`J` signup, `Tn(phone, name, role, service?, area="hatfield")`:**
- `short` = "First L." (or just the single word if there is one).
- `initials` = first letters of the first two words.
- Random hue, `simulated:false`, `joined` = current year, `saved:[]`.
- Vendors additionally get: `service ?? "repairs"`, `rateCents:20000`, `online:false`, `responseRate:100`, `verification:{identity:"pending", address:"unverified", skills:"unverified"}`.
- Notice: `` `Welcome to Nexo, ${first}` ``. Body for vendors: "Complete verification to start receiving gigs." with link `/vendor/#/profile`. Body for others: "Post your first gig or find a vendor nearby." with link `/app/#/post`.
- Returns the id.

**`aB` reset.** **`I` login.** **`aj` logout.**

**`aF` demoNextStep, `Fn(gigId, viewer)`:** returns the toast text, or null.

When the viewer is the **requestor**, it plays the vendor:

| status | action | toast text |
|---|---|---|
| bidding | first simulated eligible vendor without a bid on this gig bids at factor .97 | `` `${short} placed a bid.` `` |
| vendor_selected | `pe` | `` `${v.short} accepted your request.` `` |
| accepted | `ge` | `` `${v.short} started travelling.` `` |
| traveling | `he` | `` `${v.short} arrived.` `` |
| start_verification | `fe` with the real code | `` `${v.short} entered your start code.` `` |
| active, stage inspection | `ve` | "Inspection completed." |
| active, otherwise | `be(instant ? 180 : undefined)` + vendor_share_code | `` `${v.short} marked the gig complete and sent you the code in Messages.` `` |

When the viewer is the **vendor**, it plays the requestor:

| status | action | toast text |
|---|---|---|
| bidding | finds this session user's pending bid, selects it, then `H` | `` `${r.short} accepted your bid and paid.` `` |
| payment_pending | `H` | `` `${r.short} confirmed payment.` `` |
| start_verification | requestor_share_code | `` `${r.short} sent you the start code in Messages.` `` |
| completion_verification | `ue` with the code | `` `${r.short} verified completion — payment released.` `` |
| completed, no review | `me(5, "Excellent service, thank you!")` | `` `${r.short} left a 5-star review.` `` |

**Display helpers:**
- **`q` statusPill, `Jn(gig, viewer)`** (text differs by viewer where noted):

  | status | requestor text | vendor text | tone |
  |---|---|---|---|
  | bidding | Receiving bids | Open | gold |
  | vendor_selected | Awaiting vendor | New request | gold |
  | payment_pending | Confirm payment | Awaiting payment | gold |
  | accepted | Booked | Booked | green |
  | traveling | On the way | On the way | green |
  | start_verification | Verify start | Verify start | gold |
  | active | In progress | In progress | green |
  | completion_verification | Verify completion | Verify completion | gold |
  | completed | Completed | Completed | green |
  | cancelled | Cancelled | Cancelled | gray |

- **`ah` gigPrice, `Wn`:** uses settlement.serviceCents if settled; for instant mode, `{hourlyRateCents, hourly:true}`; otherwise `agreedCents ?? budgetCents ?? 0`.
- **`m` timeAgo:** "just now", "N min ago", "N hr ago", "yesterday", "N days ago".
- **`aw` date:** "D Mon YYYY".
- **`aG` time:** "HH:MM".
- **`a3` useTick(ms=1000):** forces a re-render on each interval.

**Export map, for import parity:**
- Components: `C`=Card, `i`=Button, `e`=Avatar, `g`=Badge, `R`=Stars, `l`=StarInput, `M`=Money, `Q`=ServiceIcon, `b`=StatTile, `E`=EmptyState, `az`=Loading, `L`=Logo, `d`=SectionTitle, `F`=Field, `y`=FieldError, `U`=Segmented, `ak`=Switch, `a8`=CodeDisplay, `x`=OtpInput, `a1`=Modal, `T`=Toaster, `t`=toast, `Y`=VerifiedBadge, `G`=GoogleIcon, `w`=AppleIcon, `n`=cx
- Data and math: `z`=services, `s`=getService, `h`=areas, `H`=areaKeys, `P`=distance, `V`=nearbyVendors, `ao`=canBid, `p`=getUser, `f`=formatRand, `ac`=bidBreakdown, `a0`=instantUpfront, `ap`=300, `a9`=OTP policy, `aI`=stages, `a4`=timing labels, `aJ`=copy, `D`="123456", `K`=demo accounts, `A`/`O`=status groups, `v`=getState, `u`=useStore, `aA`=useCurrentUser, `r`=sessionId, `N`=homeFor
- Icons: `B`=badge-check, `S`=shield-check, `a6`=loader, `X`=x, `W`=wrench, `_`=zap, `a`=star, `ag`=house, `c`=createIcon

---

# Part 2 — UI primitives (ui.js)

**`cx` (`x`):** filters out falsy values and joins with spaces.

**Logo `Yn({className="text-2xl"})`:**
- Classes: `font-display font-extrabold tracking-tight text-primary leading-none`, with `aria-label="Nexo"`.
- Renders "Nexo" followed by `<span class="text-gold">.</span>`.

**Button `Qn`:**
- Props: `{children, variant="primary", size="md", href, onClick, disabled, loading, full, type="button", icon, iconRight, className, label (aria-label)}`
- Base classes: `inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[.98] select-none whitespace-nowrap`
- `full` adds `w-full`. Disabled or loading adds `opacity-50 pointer-events-none`.
- Variants:
  - primary: `bg-primary text-white hover:bg-primary-dark shadow-primary`
  - secondary: `bg-white text-ink border border-line hover:border-primary/40 hover:bg-cream`
  - soft: `bg-primary-soft text-primary-dark hover:bg-[#d9f0e2]`
  - ghost: `text-muted hover:text-ink hover:bg-black/[.04]`
  - danger: `bg-white text-danger border border-danger/30 hover:bg-danger/5`
  - dark: `bg-ink text-white hover:bg-black`
- Sizes:
  - sm: `h-9 px-3 text-sm rounded-lg`
  - md: `h-11 px-4 text-[15px] rounded-xl`
  - lg: `h-12 px-5 text-[15px] rounded-xl`
- Content: a spinning loader (18) when loading, otherwise the icon (18, stroke 2.1), then children, then `iconRight` (hidden while loading).
- Renders `<a>` if `href` is set, otherwise `<button>`.

**Card `Xn({children, className, onClick, href, selected})`:**
- Base: `rounded-2xl bg-white border border-line/80 shadow-soft`
- Interactive (onClick or href) adds: `transition hover:shadow-card hover:-translate-y-px hover:border-primary/30 text-left`
- `selected` adds: `ring-2 ring-primary border-primary`
- Renders `<a class="block">`, a `<button class="block w-full">`, or a `<div>`.

**SectionTitle `ea({children, action, href})`:**
- Wrapper: `mb-3 flex items-center justify-between gap-3`
- Heading: h2 `font-display text-[17px] font-bold text-ink`
- Link: `text-sm font-semibold text-primary hover:underline`

**Badge `ta({children, tone="green", icon, className})`:**
- Base: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap`; icon size 13, stroke 2.4.
- Tones:
  - green: `bg-primary-soft text-primary-dark`
  - gold: `bg-yellow text-[#8a5a00]`
  - gray: `bg-black/[.05] text-muted`
  - red: `bg-danger/10 text-danger`

**VerifiedBadge `na({small})`:**
- `inline-flex items-center gap-0.5 text-primary`, title "Verified individual".
- BadgeCheck icon (14 when small, else 16, stroke 2.2).
- When not small, adds "Verified" in `text-xs font-semibold`.

**Avatar `aa({name, initials, hue=145, size=44, className})`:**
- A round span: `inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ring-2 ring-white`
- Style: width and height = `size`, `fontSize = size*.36`, background `linear-gradient(135deg, hsl(H 55% 42%), hsl((H+25)%360 60% 32%))`.
- Shows the initials. `aria-label` = name, with `role="img"` when a name is given.

**Stars `ia({value, count, size=14})`:**
- With no value: `<span class="text-xs text-muted">New</span>`.
- Otherwise: a star `fill-gold text-gold`, `value.toFixed(1)`, and `(count)` in `font-normal text-muted`.
- Wrapper: `inline-flex items-center gap-1 text-[13px] font-semibold text-ink`, with aria-label `` `Rated ${v} out of 5 from ${c} reviews` ``.

**StarInput `ra({value, onChange, size=34})`:**
- 5 buttons, `role` radio inside a radiogroup with aria-label "Rating". Each button's aria-label is "1 star" / "N stars".
- Filled star: `fill-gold text-gold`. Empty star: `text-line fill-cream-2`. Stroke 1.6.
- Buttons are disabled when there is no `onChange`.

**Money `sa({cents, className, hourly})`:**
- `font-display font-bold tabular-nums`, showing `formatRand(cents)`.
- When hourly, appends `<span class="ml-0.5 text-[0.7em] font-medium text-muted">/hr</span>`.

**ServiceIcon `oa({slug, size=20, tile=44, className})`:** a `rounded-xl bg-primary-soft text-primary-dark` tile of size `tile` px, with the mapped lucide icon at stroke 2.

**StatTile `da({icon, value, label, tone="green"})`:**
- Wrapper: `flex flex-col items-start gap-2 rounded-2xl border border-line/80 bg-white p-3.5 shadow-soft sm:flex-row sm:items-center sm:gap-3 sm:p-4`
- Icon box: `size-9 sm:size-11 rounded-xl`; gold tone uses `bg-yellow/70 text-[#8a5a00]`, otherwise primary-soft. Icon size 19.
- Value: `font-display text-lg sm:text-xl font-bold`. Label: `text-xs font-medium text-muted`.

**EmptyState `ca({icon, title, body, action})`:**
- Wrapper: `flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-10 text-center`
- Icon box: `size-14 rounded-2xl bg-primary-soft text-primary`, icon size 26.
- Title: `font-display text-base font-bold`. Body: `mt-1 max-w-sm text-sm text-muted`. Action: `mt-4`.

**Loading `la({label="Loading…"})`:** `flex min-h-[40vh] items-center justify-center gap-2 text-muted` with `role=status`, a spinning loader (`text-primary`, 20) and the label.

**FieldError `Yt`:** `<p role=alert>` with `mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger` and a circle-alert icon (15).

**Field `ua({label, error, hint, children, htmlFor})`:** label `mb-1.5 block text-[13px] font-semibold text-ink`; then children; then the error, or the hint as `mt-1.5 text-xs text-muted`.

**Segmented `ma({value, onChange, options:[{value,label}], className})`:**
- Container: `role=tablist`, `flex gap-1 rounded-xl bg-black/[.04] p-1`.
- Tabs: `flex-1 truncate rounded-lg px-2 py-2 text-sm font-semibold`. Active: `bg-white text-ink shadow-sm`. Inactive: `text-muted hover:text-ink`.

**Switch `pa({on, onChange, label})`:**
- `role=switch`, `h-8 w-14 rounded-full`, `bg-primary` when on and `bg-line` when off.
- Knob: `absolute top-1 size-6 rounded-full bg-white shadow`, at `left-7` when on and `left-1` when off.

**CodeDisplay `ga({code})`:** one box per digit: `h-14 w-11 sm:h-16 sm:w-12 rounded-xl border-2 border-primary bg-white font-display text-2xl font-bold`. aria-label "Code 1 2 3 …".

**OtpInput `ha({length=6, value, onChange, onComplete, autoFocus=true, invalid})`:**
- A hidden full-cover input (`opacity-0`, `inputMode=numeric`, `autoComplete=one-time-code`, aria-label "6-digit code").
- Non-digits are stripped and the value is sliced to `length`. `onComplete` fires when the value reaches full length.
- Boxes:
  - invalid: `border-danger`
  - focused cell (index `min(len, length-1)`): `border-primary ring-4 ring-primary/15`, showing a caret `h-6 w-0.5 animate-blink bg-primary`
  - filled: `border-primary/50`
  - otherwise: `border-line`

**Modal `fa({open, onClose, title, children})`:**
- Escape closes it.
- Overlay: `fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4`; clicking it closes.
- Panel: `role=dialog`, `w-full max-w-md animate-rise rounded-t-3xl bg-cream p-5 shadow-glass sm:rounded-3xl sm:p-6`.
- Header: h2 `font-display text-lg font-bold` and an X close button (aria "Close").

**Toaster `ba()` with `toast(text)` (`va`):**
- Uses a module-global setter. Each toast lives 3200 ms.
- Container: `pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6`, `aria-live=polite`.
- Each toast: `animate-rise rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-glass`.

**GoogleIcon / AppleIcon:** inline SVGs. Google uses the 4 brand colors #4285F4, #34A853, #FBBC05 and #EA4335.

---

# Part 3 — Phone and MapCard

**`/tmp/nexo-dl.DzJu/phone.xguO9nqm.js`** only exports `P` = the lucide `phone` icon. There is no logic in it.

**`/tmp/nexo-dl.DzJu/MapCard.lII9uDD-.js`:**
- Icon exports: `C`=camera, `b`=circle-check, `G`=gavel, `M`=map-pin, `T`=timer, `U`=user. MapCard itself is export `a`.
- The SVG has a fixed viewBox of 400×240.

**Projection `b(area, center, spanKm, seed=0)`:**
- `dx = (lng - cLng) * 111*cos(cLat)` and `dy = (lat - cLat) * 111`, both in km.
- Jitter for person markers: `angle = seed * 2.39996` (golden angle), `r = seed ? 16 + (seed*13 % 22) : 0`, `jx = cos*r`, `jy = sin*r*.7`.
- `x = 200 + dx/span*200 + jx` and `y = 120 - dy/span*120 + jy`, each clamped to the range 18 to 382 (x) or 18 to 222 (y).

**Props `R({center, markers, spanKm=14, route, progress, className, height="h-56", caption, overlay})`:**
- Container: `relative overflow-hidden rounded-2xl border border-line/80 bg-[#eef4ea]` plus the height class.
- SVG: `preserveAspectRatio="xMidYMid slice"`, absolutely positioned to fill the container. It draws:
  - a grid pattern of 28 px squares with stroke `#dfe8da`
  - a park band path `M-10 170 C 80 150, 120 200, 210 180 S 330 140, 420 160 L420 250 L-10 250Z` filled `#d7ecd3`
  - ellipses (320,60,46,26) filled `#cfe8d0` and (70,70,34,22) filled `#d4ebd3`
  - a river path `M250 -10 C 270 60, 230 110, 300 250`, stroke `#c9e0f0`, width 9
  - roads with stroke `#fffdf8`, round caps:
    - `M-10 120 C 100 110, 200 140, 420 100` (width 10)
    - `M140 -10 C 150 80, 120 160, 160 250` (width 8)
    - `M-10 40 L 420 70` (width 5)
    - `M60 250 L 360 -10` (width 5)
    - `M330 -10 C 340 100, 370 170, 360 250` (width 6)
- **Route** `{from, to}`:
  - Start point A = `b(from, center, span, 3)` (jittered); end point B = `b(to, center, span)`.
  - Control point = `((Ax+Bx)/2 + 40, min(Ay,By) - 30)`, giving a quadratic path `M A Q C B`.
  - Drawn twice: stroke `#0f8a45`, opacity .18, width 10; then a solid stroke `#0f8a45`, width 4.
- **Vendor dot:** when `progress` is set (clamped to 0–1), the point is the quadratic Bézier at t. It is drawn as a halo circle (r16, `#0f8a45`, opacity .15) plus a dot (r8, `#0f8a45`, white stroke 3).
- **Markers** are absolutely positioned at `left: x/400 %` and `top: y/240 %`:
  - `kind:"destination"`: map-pin (34) `fill-primary text-white`, stroke 1.6, `-translate-x-1/2 -translate-y-full drop-shadow`, title = label.
  - `kind:"you"`: `size-4 rounded-full bg-primary ring-[6px] ring-primary/20`, title "Your area".
  - Otherwise (person): uses jitter seed `seed ?? index+1`. A `size-9` circle with `border-2 border-white font-display text-[11px] font-bold text-white shadow-card` and background `hsl(hue 50% 38%)` (hue defaults to 145), showing initials.
- Then the `overlay` node.
- **Caption:** a pill `glass absolute bottom-2.5 left-2.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-primary-dark shadow-soft` with a circle-check icon (13).

**How the marker moves:**
- **Requestor gig page:**
  - `remaining = max(1, round(eta - (now - travelStartedAt)/60000))`.
  - `progress = .02` when accepted. When traveling, `progress = min(.92, 1 - remaining/eta)`. Otherwise 1.
  - Props: `center = gig.area`, `spanKm = 12`, `height = "h-64 sm:h-72"`, `markers = [{area, kind:"destination", label:"Your address"}]`, `route = {from: vendor.area, to: gig.area}`, caption "Route is approximate for privacy".
  - It re-renders through the ticker or `useTick`.
- **Vendor traveling view:**
  - Fixed `progress = .5`, markers destination + you, caption "Navigation", height `h-72`.
  - Text: "{km} km · about {eta} min. Tap below when you’re at the door — {req} will receive a start code." Button: "I’ve arrived".
  - On click it shows the toast "Start code sent to the requestor".

---

# Part 4 — shared.js (`/tmp/nexo-dl.DzJu/shared.fKynEcgO.js`)

Icons used: bell, briefcase (`B`), check (`C`), flask-conical, lock (`k`), log-out (`m`), megaphone (`M`), message-circle (`e`), rotate-ccw, search (`S`), send.

## Router
- `useHashRoute` (`u`): parses `location.hash` (strips `#`, defaults to `/`) into `{path, parts, query: URLSearchParams}`. On `hashchange` it re-parses and calls `scrollTo(0)`.
- `navigate(t)` (`g`) sets `location.hash = t`.
- `<Redirect to>` (`R`) navigates in an effect.

## RequireRole `Ee({role, children: (user) => node})` (export `G`)
- Hook `_e`: after mount, if there is no session id or no user, it calls `location.replace('/login/?next=' + encodeURIComponent(pathname+search+hash))`. If the role doesn't match, it calls `location.replace(homeFor(user.role))`.
- Before mount, or when the user doesn't match, it renders `<Loading label="Opening Nexo…"/>`.

## AppShell `Pe({user, nav:[{to,label,icon,mobile?,match?}], route, fab:{to,label,icon}, children, notificationsTo="/notifications"})` (export `A`)
- Starts the 1 s ticker (`Bn` on mount, then `setInterval` 1000).
- Unread count = notices for this user that are not read.
- `isPreview = URLSearchParams(location.search).has("as")`.
- A nav item is active if `item.match(route)` returns true, or if `path === to`, or if `to !== "/"` and `path.startsWith(to)`.
- Role label: "Vendor", "Admin", or "Service Requestor".
- **Root:** `min-h-dvh bg-cream lg:grid lg:grid-cols-[248px_1fr]`.
- **Desktop sidebar:**
  - Container: `sticky top-0 hidden h-dvh flex-col border-r border-line bg-white/70 px-4 py-6 lg:flex`
  - Logo (`text-[28px]`) linking to `/`, then `<nav aria-label="Main">` listing all items.
  - Items are `<a href="#to">` with classes `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold`. Active: `bg-primary-soft text-primary-dark` with icon stroke 2.3. Inactive: `text-muted hover:bg-black/[.03] hover:text-ink` with stroke 1.9. Icon size 19.
  - Footer (`border-t pt-4`):
    - Button "Reset demo data" (rotate-ccw icon). It asks `confirm("Reset all demo data to the starting state?")` and resets.
    - Button "Log out" (log-out icon). It calls `un()` and then sets `location.href = "/login/"`.
- **Header:** `glass sticky top-0 z-30 border-b border-line/70`, inner `max-w-6xl h-16`.
  - Left: the logo (26 px) linking to `#/`, mobile only. Then the suburb (shown sm to lg), or "Suburb, City" on lg.
  - Right:
    - When in preview: a pill "Preview" with `rounded-full bg-yellow px-2.5 py-1 text-[11px] font-bold text-[#8a5a00]`, hidden below sm.
    - Bell link to `#/notifications`: `size-11 rounded-xl border border-line bg-white`, aria `` `Notifications, N unread` ``. The badge is `absolute -right-1 -top-1 min-w-5 rounded-full bg-gold px-1 text-[11px] font-bold text-ink ring-2 ring-white` showing the count.
    - Profile link to `#/profile`: Avatar (38) plus `short` (bold) and the role label (11 px muted), text visible from sm.
- **Main:** `mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:pb-12 lg:pt-8`. Children sit in `<div class="animate-rise" key={route.path}>`.
- **Mobile bottom nav:**
  - Container: `glass pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line lg:hidden`, inner `max-w-lg flex items-end justify-around px-2 pt-2`.
  - Order: the first 2 items marked `mobile`, then the FAB, then mobile items 3–4.
  - Each item: `min-w-16 flex-col text-[11px] font-semibold`, `text-primary` when active, else `text-muted`. Icon 22, stroke 2.3 or 1.8.
  - FAB: `-mt-7 mb-1`, a `size-14 rounded-2xl border-4 border-cream bg-primary text-white shadow-primary active:scale-95` tile with the icon (26, stroke 2.3) and the label underneath.
  - The requestor FAB is `{to:"/new", label:"New"}`; the vendor FAB is `{to:"/opportunities", label:"Gigs"}`.
- Renders the `<Toaster/>`.

## PageHeader `Q({title, sub, back, right})` (export `P`)
- Wrapper: `mb-5 flex items-start justify-between`.
- An optional "← Back" link (`#${back}`, `text-sm font-semibold text-primary`).
- h1 `font-display text-2xl sm:text-[28px] font-bold tracking-tight`, sub `mt-1 text-[15px] text-muted`. The `right` node sits on the right.

## GigProgress `Te({gig, compact})` (export `d`)
- `s` = 4 if completed, else the stage index in `y`, or -1.
- `doneUpTo` = -1 in start_verification, 2 in completion_verification, else `s-1`.
- `current` = 0 in start_verification, 3 in completion_verification, else `s`.
- A step is done if `index <= doneUpTo` or the gig is completed. A step is current if `index === current` and the gig is not completed.
- **Compact:** `<ol aria-label="Gig progress" class="grid grid-cols-4 gap-2">`.
  - Circle `size-9 border-2`. Done: `border-primary bg-primary text-white` with a check (16, stroke 3). Current: `border-primary bg-primary-soft text-primary`. Otherwise: `border-line bg-white text-muted`.
  - The inner dot is `size-2`, `bg-primary` if current, else `bg-line`.
  - Label `text-[11px] font-semibold`, using `label.replace(" at Location","")` so "Arrival" shows instead of "Arrival at Location". It is `text-ink` if done or current, else muted.
- **Vertical:**
  - Circle `size-7` with a check (14). A connector `w-0.5 min-h-5` is `bg-primary` if done, else `bg-line`.
  - Label `text-[15px] font-semibold`. Status text "Completed" / "In progress" / "Pending" in `text-xs font-semibold`, primary for done or current, else muted.

## Line row and PaymentBreakdown
**Row `f({k, v, strong, muted})`** (export `L`): a flex `justify-between` row with `py-1.5`. The key is `text-sm` (muted or ink; semibold if strong). The value is `font-display tabular-nums`: `text-base font-bold text-primary-dark` if strong, else `text-sm font-semibold`.

**PaymentBreakdown `Be({gig, viewer})`** (export `f`) renders only once there is a settlement.

Vendor view:
- "Service amount" → service
- If billableMinutes is set: "Billed time ({h} h)" → service (muted), where h is `(min/60).toFixed(2)` with trailing zeros stripped
- "Nexo commission (3%)" → "– R …" (en dash and space, muted)
- divider
- "You received" → payout (strong)

Requestor view:
- "Service amount"
- If firstHourCents is not null: "First hour (paid at booking)" (muted) and "Remaining {h} h" → remaining (muted), where h = `(billable-60)/60`
- "Service fee (non-refundable)" → fee (muted)
- divider
- "Total paid" → total (strong)

## Notes
- **ProtectionNote `Fe`** (export `h`): `rounded-xl bg-primary-soft px-3 py-2.5 text-[13px] font-medium text-primary-dark` with a shield-check icon. The default text is "Payment protected until service completion."
- **LockNote `Ve`** (export `a`): `rounded-xl bg-black/[.035] text-[13px] text-muted` with a lock icon (15).

## GigRow `He({gig, viewer, href, amountCents, hourly, sub})` (export `j`)
- A clickable Card with `p-4`: ServiceIcon, then the title (`truncate text-[15px] font-semibold`) and `sub` (`text-[13px] text-muted`).
- Right side: Money (`text-[15px]`), with the status Badge from `Jn` below it.
- Requestor usage for `sub`:
  - bidding: "N bid(s) received · Suburb"
  - otherwise: "Vendor short · Service name"

## Demo mode panel `Ge({gig, viewer})` (export `D`)
- The label comes from `Ce(gig, viewer, hasMyPendingBid)`.
- **Requestor viewer:**
  - bidding: "Simulate a vendor bid"
  - vendor_selected: "Vendor accepts the request"
  - accepted: "Vendor starts travelling"
  - traveling: "Vendor arrives"
  - start_verification: "Vendor enters your start code"
  - active: "Vendor finishes inspection" during inspection, else "Vendor marks the gig complete"
  - anything else: hidden
- **Vendor viewer:**
  - bidding: "Requestor accepts your bid", only if this vendor has a pending bid
  - payment_pending: "Requestor confirms payment"
  - start_verification: "Requestor sends you the start code"
  - completion_verification: "Requestor verifies completion"
  - completed with no review: "Requestor leaves a review"
  - anything else: hidden
- Layout: `rounded-2xl border border-dashed border-line bg-white/50 p-4`.
  - Heading row: flask icon plus "Demo mode" (`text-[13px] font-semibold text-muted`).
  - Text: "Testing alone? Play the {vendor|service requestor}'s next step — or open the other account in the phone preview."
  - A Button (sm, secondary) with the label. On click it calls `Fn(gig.id, viewer)` and, if a string comes back, shows it as a toast.

## Ad banner `Se({slot})` (export `b`)
- On first mount (guarded by a ref) it tracks an impression; on click it tracks a click.
- Layout: `<a href>` with `group mt-8 flex overflow-hidden rounded-2xl border border-line/80 bg-white hover:shadow-card`.
  - Image: `w-28 sm:w-44 object-cover`, `loading=lazy`, `width=960`, `height=640`, `objectPosition = focus`, and `group-hover:scale-[1.03] duration-500`.
  - Text: a megaphone icon plus "Sponsored" (`text-[11px] uppercase tracking-wider font-semibold text-muted`), the title (`font-display text-[15px] sm:text-base font-bold`), and the body (`text-[13px] text-muted`).
  - CTA chip (hidden below sm): `rounded-lg border border-line px-3 py-2 text-sm font-semibold`.

| slot | title | body | cta | href | image | alt | focus |
|---|---|---|---|---|---|---|---|
| home_dashboard_bottom | Winter geyser check — 15% off | Book a verified plumber before the cold sets in. | Find plumbers | /app/#/find?service=plumbing | /ads/plumbing.jpg | Smiling tradesman in blue work overalls | 50% 25% |
| provider_dashboard_bottom | Grow with Nexo Promotions | Boost your profile in nearby search results. | Learn more | /vendor/#/profile | /ads/promote.jpg | Smiling woman holding her smartphone | 50% 28% |
| vendor_results_bottom | Need it done today? | Instant booking — vendors respond in minutes. | Post a gig | /app/#/post | /ads/cleaning.jpg | Cleaner carrying supplies up the stairs | 45% 40% |
| gig_history_bottom | Loved your last vendor? | Save them to book again in one tap. | Browse vendors | /app/#/find | /ads/rebook.jpg | Two smiling tradeswomen in hard hats | 50% 35% |
| notifications_bottom | Safety first | Every gig starts and ends with a one-time code. | How it works | /safety/ | /ads/safety.jpg | Electrician in protective gear testing a panel | 40% 40% |

## Notifications page `We({user, back})` (export `N`)
- Header: PageHeader "Notifications". The sub is "{n} unread" or "You’re all caught up". When there are unread items, a sm secondary button "Mark all read" sits on the right.
- Empty state: bell icon, "No notifications yet" / "Updates about your gigs, bids and payments will appear here."
- The list is `space-y-2.5`. Each item is an `<a href={href??"#"}>` with `flex gap-3 rounded-2xl border p-4 hover:shadow-soft`.
  - Read items: `border-line/70 bg-white/70`. Unread items: `border-primary/30 bg-white`.
  - Icon box `size-10 rounded-xl` with a bell (18), colored by tone: gold `bg-yellow/70 text-[#8a5a00]`, gray `bg-black/[.05] text-muted`, green primary-soft.
  - Title is `font-semibold`. Unread items get a dot `size-2 rounded-full bg-primary` (aria "unread"). Then the body (`text-sm text-muted`) and the timeAgo (`font-mono text-[11px] text-muted/80`).
- Ends with the `notifications_bottom` ad.

## Messages `Ue({user, route, viewer})` (export `i`)
- Conversations are gigs that have a vendorId, where the user is a party, and whose status is not bidding, vendor_selected or cancelled.
- Each conversation is `{gig, last message, other party}`, sorted by `last.at ?? gig.createdAt` descending.
- **`route.parts[1]` set (thread view):** finds the conversation and renders ChatThread. If it isn't found: an EmptyState with the message icon, "Conversation not found", and a secondary button "All messages" linking to `#/messages`.
- **List view:**
  - PageHeader "Messages" / "Conversations are tied to your gigs."
  - Empty state: "No conversations yet" / "Once a gig is booked you can message each other here."
  - Otherwise a Card with `divide-y divide-line/70`. Each row links to `#/messages/<id>` with `px-4 py-3.5 hover:bg-cream/60`.
  - Row content: Avatar, then `short` (semibold) and the timeAgo, then the gig title (13 px muted), then the last text or "Say hello 👋" (`text-sm text-ink/80`).

## ChatThread `Ae({gigId, me, other, viewer, embedded})` (export `c`)
- It auto-scrolls to the bottom when the message count changes.
- **Header (non-embedded only):** a "←" link to `#/messages`, Avatar (40), `other.short` in display bold, and a link "{title} · {ref}" to `#/gig/<id>` (requestor) or `#/job/<id>` (vendor).
- **Scroll area:** `flex-1 space-y-2.5 overflow-y-auto overscroll-contain rounded-2xl bg-white/60 p-3 sm:p-4`. Max height is `max-h-80` when embedded, else `max-h-[calc(100dvh-17rem)]`. The wrapper uses `min-h-[calc(100dvh-13rem)]` when not embedded.
- **System messages** are centered pills: `mx-auto max-w-sm rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary-dark`.
- **Message bubbles:** `max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[14.5px]`.
  - Mine: `rounded-br-md bg-primary text-white`.
  - Theirs: `rounded-bl-md border border-line bg-white text-ink`.
  - The HH:MM time is `text-[10px]`, right-aligned; `text-white/70` on mine, muted on theirs.
- **Form:**
  - A visually hidden label "Message" for input `#msg` with class `field flex-1`, placeholder "Message…", `autoComplete=off`.
  - Submit Button with the send icon, aria "Send", `className="px-3.5"`, disabled when the input is empty. The "Send" text shows only from sm.
  - On submit it calls `sendMessage(gigId, me.id, text)` and clears the input.

## FeatureRow `Oe({icon, title, body})` (export `T`)
An icon box `size-10 rounded-xl bg-primary-soft text-primary-dark`, then the title (`text-[15px] font-semibold`) and body (`text-[13px] text-muted`).

---

# Part 5 — Tailwind tokens referenced

There is no CSS in these bundles, so the hex values below are inferred from inline literals only.

- **Colors:**
  - `primary` — about `#0f8a45` (the map route color), the main green
  - `primary-dark`
  - `primary-soft` — a light green; its hover is `#d9f0e2`
  - `gold` — stars, unread badge, the logo dot
  - `yellow` — gold badge background, with text `#8a5a00`
  - `cream` — app background
  - `cream-2` — empty-star fill
  - `ink` — text, dark button, toast and overlay `bg-ink/40`
  - `muted` — secondary text
  - `line` — borders
  - `danger`
- **Opacity variants used:**
  - line: `/70`, `/80`
  - primary: `/15`, `/20`, `/30`, `/40`, `/50`, `/70`
  - ink: `/70`, `/80`, `/85`
  - yellow: `/40`, `/70`
  - danger: `/5`, `/10`, `/30`
  - also `muted/80`, `primary-soft/50` and `/60`, `cream/60`, `gold/60` and `/70`
- **Shadows:** `shadow-soft`, `shadow-card`, `shadow-glass`, `shadow-primary`.
- **Fonts:** `font-display` (headings, numbers, avatars), `font-mono` (timestamps), and the default sans.
- **Animations:** `animate-rise` (page, modal and toast enter), `animate-blink` (OTP caret), `animate-spin`.
- **Custom utility classes:** `glass` (header, bottom nav, map caption), `field` (inputs), `pb-safe` (safe-area bottom padding), `no-scrollbar`.
- **Map palette:** `#eef4ea` (background), `#dfe8da` (grid), `#d7ecd3`, `#cfe8d0` and `#d4ebd3` (parks), `#c9e0f0` (river), `#fffdf8` (roads).
