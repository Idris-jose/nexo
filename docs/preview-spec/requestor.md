I've mapped the whole Requestor app below. Imported letter aliases were resolved through `ui.DbJ6xcJi.js`, `shared.fKynEcgO.js`, `MapCard.lII9uDD-.js` and `phone.xguO9nqm.js`. Nothing was executed.

**Caveats:**
- The chunk `layout-dashboard.BP8dJ4pP.js` was not downloaded. From it, `Ps` is almost certainly the layout-dashboard icon. `Pe` is used for "Test card" and "Payment methods", and I'm guessing it is the credit-card icon; that is not confirmed.
- The ad images (`/ads/*.jpg`) and the `/login/` and `/safety/` pages are outside this bundle.
- There is no real card form, no dispute or support screen, and no date/time picker. Details are in sections 15–16.

Strings are quoted exactly. `’`, `“”`, `—` and `…` are literal Unicode characters in the source. Money is formatted as `R` + NBSP + thousands groups separated by NBSP (U+00A0, e.g. "R 1 500"). Cents are shown only if they are non-zero (",05"). Negative amounts get a leading "-".

---

## 0. Global architecture

**Storage.** All data lives in localStorage key `gig.demo.state` (`version: 5`).
- The session user id comes from the `?as=` URL query param, or else from localStorage `gig.demo.session`.
- If the stored version is newer than the app's, the app reloads once (guarded by sessionStorage `gig.demo.reloaded`).
- Other tabs stay in sync through the `storage` event.
- The store is read with `useSyncExternalStore`. Every mutation does structuredClone → mutate → save → notify.

**Auth gate (`G` / `Ee`, role "requestor").**
- While checking it shows a spinner with the text "Opening Nexo…".
- With no session or an unknown user, it redirects to `/login/?next=<encoded path+search+hash>`.
- A user with the wrong role is sent to their own app: vendor → `/vendor/`, admin → `/admin/`, requestor → `/app/`.

**Hash router.** It reads `location.hash` without the `#` and splits it into `path`, `parts` and `query`. On each `hashchange` it scrolls to the top. Navigation is `location.hash = path`.

**Background job runner.** While the shell is mounted it runs every 1000 ms. It executes simulated actions whose due time has passed (section 13).

**Toasts.** A global toaster sits bottom-center (`bottom-24` on mobile, `lg:bottom-6`). Toasts are dark pills with `animate-rise`, and each disappears after 3200 ms.

**Seed user (default requestor).**
- id `u_alex`, "Alex Thompson", short "Alex T.", initials "AT", phone `821234567`, area `hatfield`, hue 24.
- Rating 4.9 (11 reviews), 5 completed.
- Saved providers: `u_john`, `u_sarah`, `u_thabo`, `u_mia`.

**Constants.**
| Constant | Value |
|---|---|
| Service fee | 2000 cents (R20), non-refundable |
| Vendor commission | 300 bps (3%), shown to vendors only |
| Search radius | 30 km |
| Distance | Haversine, rounded to 0.5 km, minimum 0.5 |
| OTP | `{ttlSeconds: 600, maxAttempts: 5, maxResends: 3}`, 6-digit codes from `crypto.getRandomValues` |
| Instant billing | billable minutes = max(60, ceil(min/15)×15); service = rate × min / 60 |

**Timing labels.** `asap` → "ASAP", `this_week` → "This week", `flexible` → "Flexible".

**Areas** (key → suburb, city):

| Key | Suburb, city |
|---|---|
| `hatfield` | Hatfield, Pretoria |
| `arcadia` | Arcadia, Pretoria |
| `sunnyside` | Sunnyside, Pretoria |
| `brooklyn` | Brooklyn, Pretoria |
| `menlopark` | Menlo Park, Pretoria |
| `waterkloof` | Waterkloof, Pretoria |
| `garsfontein` | Garsfontein, Pretoria |
| `cbd` | Pretoria Central, Pretoria |
| `montana` | Montana, Pretoria |
| `lyttelton` | Lyttelton, Centurion |
| `centurion` | Centurion Central, Centurion |
| `midrand` | Midrand, Midrand |

All are in the province "Gauteng", and each has lat/lng.

**Service categories** (12, in this order; slug / name / trade / icon / blurb / typical price):

| Slug | Name | Trade | Icon | Blurb | Typical |
|---|---|---|---|---|---|
| `electrical` | Electrical | Electrician | zap | "DB boards, faults, lights, plugs and COCs." | R1 200 |
| `plumbing` | Plumbing | Plumber | droplets | "Leaks, geysers, blocked drains and fittings." | R800 |
| `cleaning` | Cleaning | Cleaner | sparkles | "Deep cleans, move-out cleans and regular help." | R500 |
| `painting` | Painting | Painter | paintbrush | "Interior and exterior painting, touch-ups." | R1 800 |
| `moving` | Moving | Mover | truck | "Furniture moves, deliveries and collections." | R900 |
| `repairs` | Repairs | Handyman | hammer | "Doors, shelves, fittings and odd jobs." | R600 |
| `gardening` | Gardening | Gardener | sprout | "Garden clean-ups, lawns and planting." | R450 |
| `tutoring` | Tutoring | Tutor | graduation-cap | "Maths, science and exam prep, at home or online." | R400 |
| `massage` | Massage | Massage therapist | hand-heart | "Relaxation and sports massage at home." | R600 |
| `events` | DJ & Events | DJ | music | "DJs and event help for parties and functions." | R2 500 |
| `admin` | Admin Support | Admin assistant | clipboard-list | "Bookkeeping, filing and paperwork." | R700 |
| `locksmith` | Locksmith | Locksmith | key-round | "Lock-outs, lock changes and security gates." | R650 |

Each category also has a `category` group key, for example `technical-services` or `home-services`.

---

## 1. App shell (`AppShell`, shared `Pe`)

**Nav config** (`Os`, used in this order on the desktop sidebar):

| Label | Icon | Route | Mobile | Active match |
|---|---|---|---|---|
| Home | house | `/` | yes | path === "/" |
| My Gigs | briefcase | `/gigs` | yes | path starts with `/gigs` or `/gig/` |
| Find Vendors | search | `/find` | no | default rule |
| Post a Gig | gavel | `/post` | no | default rule |
| Messages | message-circle | `/messages` | yes | default rule |
| Saved Providers | heart | `/saved` | no | default rule |
| Profile | user | `/profile` | yes | default rule |

The default active rule is: `path === to`, or `to !== "/"` and the path starts with `to`.

**FAB.** `{to:"/new", label:"New", icon: plus}`.

**Desktop sidebar** (lg and up, 248px, sticky, full height):
- Logo "Nexo" with a gold "." (aria-label "Nexo"), linking to `/`.
- The nav list. The active item gets `bg-primary-soft text-primary-dark` and a heavier icon stroke (2.3 instead of 1.9).
- Footer buttons:
  - "Reset demo data" (rotate-ccw): `confirm("Reset all demo data to the starting state?")` → reseeds state.
  - "Log out" (log-out): clears the session key → `location.href="/login/"`.

**Sticky glass header** (h-16):
- Left:
  - Mobile only: the logo, linking to `#/`.
  - Small screens: the user's suburb.
  - lg: "Suburb, City".
- Right:
  - A "Preview" yellow pill, shown only when the URL has `?as=`.
  - Bell button linking to `#/notifications`. aria-label is "Notifications" or "Notifications, N unread". A gold count badge shows when there are unread items.
  - Profile link (`#/profile`): avatar (38px), the user's short name, and the role label "Service Requestor".

**Main area.**
- `max-w-6xl`, with bottom padding `pb-32` on mobile.
- Content is wrapped in `animate-rise`, keyed by path, so it re-animates on every route change.

**Mobile bottom nav** (below lg, glass, fixed): Home, My Gigs, [FAB], Messages, Profile.
- The FAB is raised (`-mt-7`): a 56px green rounded-2xl square with a 4px cream border, a plus icon, and the label "New".
- Active tab is green with a heavier stroke.

**Page header component (`L`/`Q`).**
- Optional "← Back" link to `#<back>`.
- h1 title, optional subtitle, optional right-side slot.

---

## 2. Route table (`Hs`)

| Hash | Screen |
|---|---|
| `#/` (empty) | Home dashboard (`Ys`) |
| `#/new` | New-service chooser (`Ws`) |
| `#/post[?service=slug]` | Post a Gig (`qs`) |
| `#/find[?service=slug][&q=text]` | Find Vendors (`Is`) |
| `#/gig/:id` | Gig detail (`Gs`) |
| `#/gigs` | Your gigs list (`Us`) |
| `#/vendor/:id` | Vendor profile (`Es`) |
| `#/messages`, `#/messages/:gigId` | Messages list / thread (shared `Ue`) |
| `#/notifications` | Notifications (shared `We`, back "/") |
| `#/saved` | Saved providers (`Zs`) |
| `#/profile` | Profile (`Qs`) |
| anything else | Empty state, search icon, "Page not found", button "Go home" → `#/` |

`#/gig` and `#/vendor` without an id also fall through to "Page not found".

---

## 3. Home (`#/`)

**Greeting (h1).** Depends on the local hour:
- before 12: "Good morning"
- before 18: "Welcome back"
- otherwise: "Good evening"

Followed by ", {first name}!". Subtitle: "Let’s get things done today."

**Search form** (`role="search"`):
- Search icon on the left. sr-only label "What service do you need?".
- Input placeholder "New service? Try “plumber” or “cleaning”" (h-14, rounded-2xl).
- Submit button "Search".
- On submit, the trimmed lower-case query is matched against category name, trade or blurb (substring). The first match sets `location.hash="/find?service=<slug>"`. No match, or an empty query, goes to `/new`.

**Stat tiles** (3 columns):
- zap: value is the count of active plus open gigs, label "Active gigs".
- briefcase: count of completed gigs, label "Past gigs".
- heart (gold): count of saved providers, label "Saved providers".

The status groups used throughout:
- Active = `accepted`, `traveling`, `start_verification`, `active`, `completion_verification`.
- Open = `bidding`, `vendor_selected`, `payment_pending`.

**Main column.**
1. **Two quick tiles** (cards with a green icon square):
   - "Post a Gig" (gavel), "Get bids from vendors" → `#/post`.
   - "Find Vendors" (zap), "Book someone now" → `#/find`.
2. **"Active gigs"** (only if any), with a right link "All gigs" → `#/gigs`. One `ActiveGigCard` per active gig:
   - Card with a green ring. Badge "Active gig" (zap) and the amount.
   - Vendor avatar (44px), gig title, and a status line:
     - `accepted`: "{V} is getting ready"
     - `traveling`: "{V} is on the way · ETA {n} min"
     - `start_verification`: "{V} has arrived — share your code"
     - `completion_verification`: "Enter the completion code"
     - otherwise: "Gig in progress"
   - ETA = max(1, round(etaMinutes − minutes since `travelStartedAt`)).
   - Button "View details" with a chevron-right → `#/gig/:id`.
   - Right side (220px on sm+): a mini map. Center is the gig area, span 12 km, a destination pin, and a route from the vendor area. Route progress: `traveling` → 1 − eta/etaMinutes; `accepted` → 0; else 1.
3. **"Waiting on you"** (open gigs, only if any). `GigRow` per gig (see §6) with sub-line:
   - `bidding`: "{n} bid(s) received · {suburb}" (singular "bid" when n = 1).
   - other open statuses: "{vendor short} · {service name}".
4. **"Browse services"**, right link "See all" → `#/new`.
   - All 12 categories. Mobile: horizontal scroll. sm+: a 6-column grid.
   - Each is a 56px icon tile plus the name, linking to `#/find?service=<slug>`.
5. **"Recommended providers"**, right link "See all" → `#/find`.
   - Vendors with status active and identity verified, within 30 km. Online is not required.
   - Sorted saved-first, then by rating descending. Top 4, shown in a 2-column grid of `VendorMiniCard`:
     - Avatar, short name, verified tick, trade, star rating with (count), rate "/hr".
     - Heart toggle. aria-label is "Save {short}" or "Remove {short} from saved". It toggles `saved` on the user. The heart is filled when saved.
     - The left part links to `#/vendor/:id`.

**Aside.**
- Map: centered on the user's area, span 16 km, h-60. A "you" dot plus up to 8 vendor initials markers. Caption "{n} providers nearby · approximate".
- Card "Why Nexo" with three items:
  - shield-check: "Verified individuals" / "ID and skills checked before vendors can take gigs."
  - lock: "Payment protection" / "Held until you confirm the job is done."
  - refresh-cw: "OTP at start & end" / "A one-time code confirms every gig begins and finishes."

**Sponsored ad slot** `home_dashboard_bottom` (component described in §14):
- Title "Winter geyser check — 15% off"
- Body "Book a verified plumber before the cold sets in."
- CTA "Find plumbers" → `/app/#/find?service=plumbing`

---

## 4. New service chooser (`#/new`, the FAB target)

Header "New service?", sub "Two ways to get it done — your choice.", back "/".

Two link cards (icon tile, title, gold tag badge, body, chevron):
- "Post a Gig" (gavel), tag **"Bid flow"**: "Describe the work, set a budget and let nearby verified vendors bid. Pick the best offer." → `#/post`
- "Find Vendors" (zap), tag **"Instant"**: "See verified vendors near you right now and request one at their hourly rate." → `#/find`

---

## 5. Post a Gig (`#/post?service=`)

Header "Post a Gig", sub "Tell us what you need done. Vendors nearby will bid.", back "/new". Layout is the form plus a 320px aside.

**Fields** (Field component: label, then input, then either an error with a circle-alert in red with `role=alert`, or a hint):

1. **Service** (required). A grid of 12 category buttons (3 or 4 columns).
   - Each button has an icon tile (34px) and the name, with `aria-pressed`. Selected style: primary border on a soft background.
   - Default is the `?service` preset if valid, otherwise none.
   - Error: "Choose a service".
2. **Title** (`#t`).
   - Placeholder: "e.g. {first comma-chunk of the category blurb}" (e.g. "e.g. DB boards"), or "e.g. DB board installation" when no service is chosen.
   - Error if the trimmed length is below 3: "Give the gig a short title".
3. **Describe the work** (`#d`, textarea, 4 rows).
   - Placeholder "e.g. Need installation of a DB board and rewiring of the kitchen circuit."
   - Error if fewer than 10 characters: "Describe the work in a sentence or two".
4. **Photos (optional)**. Hint: "Photos help vendors quote accurately. They stay private until you choose a vendor."
   - This is only a counter from 0 to 4. There is no real upload.
   - Each "photo" is an 80px striped placeholder with a camera icon and a small x button (aria "Remove photo") that decrements the count.
   - A dashed "+ Add" tile (image-plus icon) increments the count. It shows only while the count is below 4.
5. **Budget (total)** (`#b`, `inputMode=numeric`).
   - A fixed "R" prefix. Typing strips everything except digits and spaces. Placeholder "1 500".
   - Hint when a service is chosen: "Typical for {name lowercased}: about {typical}".
   - Parsing: digits only × 100 cents.
   - Errors: empty or zero → "Enter your budget in rand"; more than 10 000 000 cents → "Budget must be under R100 000".
6. **When do you need this done?** Segmented tabs "ASAP" / "This week" / "Flexible". Default `asap`.
7. **Service area** (`#a`, select).
   - All 12 areas, shown as "Suburb, City". Default is the user's area.
   - Hint "Vendors see only this suburb and their distance."
8. **Street address (private)** (`#ad`, `autocomplete=street-address`).
   - Default "14 Burnett Street, Hatfield, Pretoria" if the user is `u_alex`, otherwise empty. Placeholder "House number and street".
   - Hint "Released only to the vendor you book."
   - Error if fewer than 6 characters: "Enter the street address — it stays private".

All errors are computed together, and the form only submits when there are none.

**Button "Post Gig"** (full width, large, shows a loading spinner).
- Creates the gig with `mode:"bid"`, status `bidding`, ref `GIG-<seq+1>`.
- Notifies eligible vendors: same service, active, identity verified, online, within 30 km, not the requestor. Each gets "New gig near you".
- Schedules simulated auto-bids (§13).
- Notifies the requestor: "Your gig is live" / "{n} verified vendor(s) nearby can bid."
- Toast "Gig posted — nearby vendors are being notified", then navigates to `/gig/<id>`.

**Aside.**
- Card "How bidding works", an ordered list with numbered green circles:
  1. "Verified vendors within 30 km get your gig."
  2. "They bid with a price and arrival time."
  3. "Pick a bid. You pay the bid + R20 service fee."
  4. "Payment stays protected until you verify completion."
- Card shown when a service is chosen:
  - "Available near {suburb}"
  - Big number "{n} {trade lowercased}" with a plural "s" unless n = 1. n counts vendors that are online, identity verified and within 30 km.
  - "verified and online within 30 km"
- Privacy note (lock icon, grey): "Your exact address is only shared with the vendor you book — never with bidders."

---

## 6. Find Vendors (`#/find?service=&q=`)

**Initial category.**
- The valid `?service` value; otherwise the first category whose name contains `q`; otherwise `electrical`.
- This is only the initial state. Changing the query while staying on the page does not reset it.

Header "Find Vendors", sub "Verified {trade lowercased}s within 30 km of {user suburb}", back "/new".

**Category chips.** Pill buttons for all 12 categories, with `aria-pressed`. Selected chip is solid primary. Horizontal scroll on mobile, wrapping on sm+.

**Results.**
- Vendors with the matching service, status active, identity verified, within 30 km. Offline vendors are included.
- Sorted online first, then by km ascending.

**Each result card:**
- 52px avatar linking to `#/vendor/:id`.
- Short name, small verified tick (title "Verified individual"), trade.
- Heart button, aria "Save" or "Unsave", toggles saved; filled when saved.
- Row: star rating "4.8 (120)" ("New" if there is no rating), a map-pin with "{km} km", and a badge "Available" (green) or "Offline" (gray).
- Rate as "R 250/hr".
- Button "Request" (zap, small). When the vendor is offline it is disabled and labelled "Offline". Clicking opens the Request modal (§7).

**Empty state** (search icon):
- "No {trade}s nearby yet" / "Try another service, or post a gig so vendors can find you."
- Button "Post a Gig instead" → `#/post?service=<slug>`.

**Below the list.**
- Privacy note: "Only distance is shown — exact locations stay private until a gig is accepted."
- Ad slot `vendor_results_bottom`: "Need it done today?" / "Instant booking — vendors respond in minutes." / CTA "Post a gig" → `/app/#/post`.

**Aside** (xl only, sticky top-24): a map 420px tall, span 18 km, the "you" dot plus all result vendors as initials markers. Caption "Approximate areas only".

---

## 7. Request vendor modal (instant booking, `De`)

Opened from Find Vendors or the vendor profile.

**Modal behaviour.**
- On mobile it is a bottom sheet; on sm+ it is centered, max-w-md, with `animate-rise`.
- Backdrop click, Escape, or the X button (aria "Close") closes it.
- Title "Request {short}".

**Fields:**
1. **Title** (`#rt`). Default "{Service name} request". Not validated. If left empty it falls back to the default.
2. **What do you need?** (`#rd`, textarea, 3 rows). Placeholder "Describe the job". At least 10 characters, else "Describe the work in a sentence or two".
3. **When?** Segmented ASAP / This week / Flexible. Default `asap`.
4. **Street address (private)** (`#ra`).
   - Default is the Alex address for `u_alex`.
   - Hint "Shared with the vendor only after they accept and you pay."
   - At least 6 characters, else "Enter the street address — it stays private".

The area is not selectable here; it uses the user's own area. Photos are always 0.

**Price box:**
- "First hour at R 250/hr" → rate
- "Service fee (non-refundable)" → R 20 (muted)
- "Due when they accept" → rate + R20 (bold)
- Note "Remaining time is billed per 15 minutes after completion."

**Button "Send request"** (zap).
- Creates an `instant` gig with `vendorId`, `hourlyRateCents` = the vendor's rate, status `vendor_selected`.
- The vendor is notified "New instant request" (gold).
- If the vendor is simulated, an auto-accept is scheduled after 5 s.
- Toast "Request sent to {short}", the modal closes, and the app navigates to `/gig/<id>`.

---

## 8. Gig detail (`#/gig/:id`)

The screen re-renders every 5 s. If the gig doesn't exist or isn't the user's: empty state "Gig not found" / "It may have been removed." with a button "Your gigs" → `#/gigs`.

**Header.**
- Link "← Your gigs".
- Service tile (46px), h1 title.
- Sub-line "{ref} · {Bid flow|Instant} · posted {relative}". Relative times: "just now", "N min ago", "N hr ago", "yesterday", "N days ago".
- Status badge with requestor-facing labels:

| Status | Label | Tone |
|---|---|---|
| `bidding` | Receiving bids | gold |
| `vendor_selected` | Awaiting vendor | gold |
| `payment_pending` | Confirm payment | gold |
| `accepted` | Booked | green |
| `traveling` | On the way | green |
| `start_verification` | Verify start | gold |
| `active` | In progress | green |
| `completion_verification` | Verify completion | gold |
| `completed` | Completed | green |
| `cancelled` | Cancelled | gray |

The full status enum is exactly these 10 values. There is no disputed status.

**Layout.** Main column plus a 360px aside.
- Main column: the status panel (§8.1–8.8), then the **Demo mode panel** (§12).

**Aside.**
- Card "Gig details":
  - The description.
  - Key/value rows: "Budget" (bid mode, budget) or "Hourly rate" ("R x/hr"); "When" (ASAP / This week / Flexible); "Area" (suburb); "Photos" (count, only if above 0).
  - Map-pin line with the full address and a green "(private)".
  - **"Cancel gig"** button (danger, small), shown only for `bidding`, `vendor_selected` and `payment_pending`.
    - `confirm("Cancel this gig?")` → status `cancelled`, `cancelledAt` set, pending bids rejected, scheduled jobs for the gig removed.
    - The vendor, if any, is notified "Request cancelled" (gray). Toast "Gig cancelled".
- Card "Chat with {vendor short}" containing the embedded chat (§10, max-h-80). Shown only when there is a vendor and the status is not `bidding`, `vendor_selected`, `payment_pending` or `cancelled`.

### 8.1 `bidding`: Incoming bids

- Title "Incoming bids", with a green badge "Live" whose loader icon spins.
- Bids shown: pending bids for this gig, sorted by amount ascending.

**No bids yet:**
- Spinning loader.
- "Waiting for bids…" / "Nearby vendors have been notified. New bids appear here instantly."

**Each bid card** (`animate-rise`, bordered):
- Vendor avatar, short name and verified tick.
- Rating (size 12), a clock with " ETA {etaMinutes} min", and "{km} km" (vendor area to gig area).
- Right side: the bid amount (large) with "their bid" underneath.
- The note in quotes on a cream background, if present.
- Buttons:
  - **"Accept bid"** (check icon) → `acceptBid(bidId)`. Only if the gig is `bidding` and the bid is `pending`. Sets `selectedBidId`, `vendorId`, `agreedCents`, and status **`payment_pending`**. It goes straight to payment; there is no vendor-acceptance step in bid mode. There is no toast.
  - **"View profile"** (secondary) → `#/vendor/:id`.

### 8.2 `vendor_selected` (instant request awaiting the vendor)

A centered card:
- Spinning loader.
- "Waiting for {V} to accept"
- "You’ll be asked to confirm payment once they accept. Nothing is charged yet."

If the vendor accepts, the status becomes `payment_pending` and the requestor gets the notice "{V} accepted your request" / "Confirm payment to book them." (gold). If the vendor declines, the status becomes `cancelled` with the notice "Vendor unavailable" / "{V} can't take {title}. Try another vendor." linking to `/app/#/find`.

### 8.3 `payment_pending`: Confirm & pay (escrow screen)

- Title "Confirm & pay".
- Vendor strip (cream): avatar, short name, verified tick, rating.

**Line items:**
- Bid mode:
  - "Accepted bid" → `agreedCents`
  - "Service fee (non-refundable)" → R 20
- Instant mode:
  - "First hour at R x/hr" → rate
  - "Service fee (non-refundable)" → R 20
- Then a divider and **"Pay now"** → the total (bid + R20, or rate + R20).

**Payment method.** There is no card form, only a static row:
- Credit-card icon (inferred).
- **"Test card •••• 4242"**
- "Demo mode — no real money moves"

Protection notice (shield-check, green box): "Payment protected until service completion."

**Buttons:**
- **"Pay {total}"** (shield-check, large, full width).
  - Sets loading, then after 700 ms calls `confirmPayment(gigId)`.
  - Toast "Payment confirmed — gig booked".
- **"Choose another bid"** (secondary, bid mode only).
  - The gig returns to `bidding`; `selectedBidId`, `vendorId` and `agreedCents` are cleared.
  - Bid statuses are untouched, so the bid list reappears.

**Effects of `confirmPayment`:**
- Payments recorded:
  - Bid mode: `service_fee` R20 **captured**, plus `bid_amount` **authorized** (the escrow hold).
  - Instant mode: `service_fee` captured, plus `first_hour` authorized.
- Bid mode only: the selected bid becomes `accepted`; other pending bids become `rejected`, and those vendors get "Bid not selected" / "{title} went to another vendor." (gray).
- Status → **`accepted`**. `paidAt` and `addressReleasedAt` are set to now.
- System chat message: "{V} is booked. Payment is protected until service completion."
- Vendor notice: "You won the bid!" (bid) or "Booking confirmed" (instant) / "{R} confirmed {title}. The exact address is now available."
- Requestor notice: "Booking confirmed" / "{V} will head over soon."

### 8.4–8.7 Live tracking panel (`accepted`, `traveling`, `start_verification`, `active`, `completion_verification`)

This panel re-renders every 1 s.

**Computed values:**
- `etaLeft` (traveling only) = max(1, round(etaMinutes − minutes since `travelStartedAt`)).
- `progress`:
  - `accepted` → 0.02
  - `traveling` → min(0.92, 1 − etaLeft/etaMinutes)
  - otherwise → 1

**Sections in order:**

**a. Compact progress card.** Four steps in a 4-column grid: "Arrival" (the label "Arrival at Location" with " at Location" stripped), "Inspection", "Gig", "Gig Completed".
- A step is done (green filled with a check) or current (soft green with a dot). Logic:
  - completed: all done.
  - `start_verification`: current = step 0.
  - `completion_verification`: steps 0–2 done, current = step 3.
  - otherwise: current = stage index, done = earlier steps.
- In `accepted`/`traveling` there is no stage, so nothing is highlighted.
- The `stage` field moves: `arrival_at_location` on arrival → `inspection` after the start OTP → `gig` → `gig_completed`.

**b. Map** (`accepted` or `traveling` only).
- h-64, sm:h-72. Centered on the gig area, span 12 km.
- Destination pin labelled "Your address".
- Route from the vendor's home area to the gig area: a quadratic bezier, green, with a halo.
- A moving dot at position `progress` along the curve.
- Caption (shield icon) "Route is approximate for privacy".

The map is a stylised SVG, not real tiles:
- 400×240 viewBox, 28px grid pattern, green land shapes, a blue river, white roads.
- Positions come from lat/lng offsets scaled by `spanKm` and clamped to 18px from the edges.
- Person markers are spread around their area with a golden-angle jitter based on `seed`.

**c. Vendor card.**
- Avatar (50px).
- Headline:
  - `accepted`: "{V} is getting ready"
  - `traveling`: "{V} is on the way"
  - `start_verification`: "{V} has arrived"
  - `active`: "Gig in progress"
  - `completion_verification`: "{V} marked the gig complete"
- Sub-line: "ETA {n} min · {km} km" while traveling; otherwise "{trade} · {V}".
- Two buttons:
  - **"Call"** (phone icon): toast "Calls are masked in production — demo only".
  - **"Message"** (message-circle) → `#/messages/:gigId`.

**d. "Next step" card** (`accepted`/`traveling`, soft green, shield icon):
- Small label "Next step"
- "Arrival at Location"
- "When {V} arrives you’ll get a 6-digit start code to share with them."

**e. Start code display (OTP handover)** (`start_verification` with a `startOtp`):
- Badge (map-pin) "Vendor has arrived".
- "Share this start code".
- "Only give it to {V} once they are with you. It confirms the right person started your gig."
- The code shown as 6 boxes (h-14 × w-11, primary border, large digits), aria "Code 1 2 3 4 5 6".
- Timer line: "Expires in m:ss · attempts left {5 − attempts}". The countdown updates every second and floors at 0:00; nothing happens automatically on expiry.
- **"Issue a new code"** (ghost, small) → `resendOtp(gigId,"start")`. This creates a new code with a 600 s TTL, attempts reset to 0, resends + 1. Toast "New start code issued", or the error "Resend limit reached. Contact support." after 3 resends.

**f. Active** (`active`):
- Card "Track progress in real time" containing the full vertical timeline.
- Each step shows its label and a status of "Completed", "In progress" or "Pending", with green connecting lines.

**g. Verify completion** (`completion_verification`):
- Gold badge (circle-check) "Vendor marked the gig complete".
- "Verify completion".
- "Check the work, then enter the 6-digit code {V} gives you. This releases their payment."
- **OTP input.** A hidden numeric input (`autocomplete=one-time-code`, maxLength 6, autofocus, digits only) over 6 visual boxes.
  - The focused box gets a ring and a blinking caret (`animate-blink`).
  - Boxes turn red when the code is invalid.
  - Clicking anywhere focuses the input.
  - Typing clears the error.
- Error shown as a red alert (circle-alert).
- **"Verify & release payment"** (shield-check, large). Disabled until 6 digits are entered. Calls `verifyCompletion(gigId, code)`.
  - Possible errors:
    - "This gig is not waiting for completion."
    - "This code has expired. Ask for a new one."
    - "Too many attempts. Request a new code."
    - "That code doesn't match. {n} {try|tries} left."
  - The input is cleared on error.
  - On success: toast "Completion verified — payment released".
- Footer: "Check Messages — your vendor can send the code there."
- The requestor has no resend button for the completion code.

**Settlement on success:**
- Bid mode: the `bid_amount` payment is captured.
- Instant mode:
  - Billable minutes = max(60, ceil(actual/15)×15).
  - The `first_hour` payment is captured.
  - Any remaining amount is added as a captured `remaining_hours` payment.
  - `actualMinutes` was set when the vendor marked complete: max(60, elapsed), or a simulated 150 or 180 minutes.
- The gig stores `settlement` {serviceCents, feeCents, totalCents, commissionCents (3%), payoutCents, plus billableMinutes, firstHourCents, remainingCents for instant}.
- Status `completed`, stage `gig_completed`, `completedAt` set.
- Vendor: completed count +1, wallet and lifetime earnings increased, a payout row added.
- System message: "Completion verified. Payment released to the vendor."
- Notices: the vendor gets "Payment released"; the requestor gets "Gig completed" / "Rate {V} to help the community."

### 8.8 `completed`

- Card with a 64px green circle and a check (`animate-pop`), "Gig Completed!", and "{title} with {V}".
- Card "Payment summary":
  - "Service amount".
  - Instant mode only: "First hour (paid at booking)" and "Remaining {h} h" (hours to 2 decimals, trailing zeros stripped).
  - "Service fee (non-refundable)".
  - Divider, then "Total paid" (bold).
  - Protection notice: "Payment was protected until service completion — now released."
- **Review card:**
  - If a review exists: "Your review", read-only stars (size 28), and the quoted text.
  - Otherwise:
    - "Rate your experience" / "How was your gig with {V}?"
    - Five star buttons (34px, radiogroup "Rating", aria "N star(s)", `active:scale-90`, gold fill up to the chosen value). Default 0.
    - Textarea `#rv` (sr-only label "Review"), 3 rows, placeholder "Great service, very professional!". Optional.
    - **"Submit review"**, disabled until a rating is chosen. Calls `submitReview(gigId, rating, text.trim())`.
      - Only works if the gig is completed and has no review yet.
      - The vendor's rating becomes the new rolling average, rounded to 1 decimal; review count +1.
      - Vendor notice "New {n}-star review".
      - Toast "Thanks — review submitted".

### `cancelled`

Empty state with an x icon: "This gig was cancelled" / "No service fee was charged." Button "Start a new service" → `#/new`.

---

## 9. Your gigs (`#/gigs`)

- Header "Your gigs", sub "Everything you’ve booked or posted.", right button "New" (plus, small) → `#/new`.
- Segmented tabs "All" / "Active" / "Open" / "Completed" (groups as defined in §3). "All" also includes cancelled gigs.
- Sorted by `(completedAt ?? createdAt)` descending.

**GigRow** (link card to `#/gig/:id`):
- Service tile, title.
- Sub-line "with {V short} · {ref}", or "{service name} · {ref}" when there is no vendor.
- Right side: amount and status badge. The amount is the settlement service amount if settled; else the hourly rate with "/hr" for instant gigs; else the agreed amount or budget.

**Empty state** (briefcase): "Nothing here yet" / "Post a gig or book a vendor and it will show up here." Button "New service" (plus) → `#/new`.

Ad slot `gig_history_bottom`: "Loved your last vendor?" / "Save them to book again in one tap." / CTA "Browse vendors" → `/app/#/find`.

---

## 10. Messages (`#/messages`, `#/messages/:gigId`; shared)

**List.**
- Header "Messages", sub "Conversations are tied to your gigs."
- Includes gigs that have a vendor and where the user is a party, excluding `bidding`, `vendor_selected` and `cancelled`.
- Sorted by last message time (or gig creation time) descending.
- Each row: avatar, the other party's short name, relative time, gig title, and the last message text (or "Say hello 👋").
- Empty state: "No conversations yet" / "Once a gig is booked you can message each other here."

**Thread** (an unknown id shows "Conversation not found" with a button "All messages"):
- Header: "←" link to `#/messages`, avatar (40px), the other party's short name, and a link "{title} · {ref}" → `#/gig/:id`.
- Scrolling pane that auto-scrolls to the bottom when new messages arrive.
- Message styles:
  - System messages (`fromId` null): centered green pill.
  - Mine: right-aligned, green, `rounded-br-md`.
  - Theirs: left-aligned, white, bordered.
  - Each has an HH:MM timestamp.
- Form: input `#msg`, placeholder "Message…", `autocomplete` off. Send button (send icon, label "Send" visible on sm+), disabled when empty.
- Sending pushes the message and notifies the other party "Message from {short}" with the first 80 characters (gray).

The same chat is embedded in the gig detail aside.

---

## 11. Notifications, Saved, Vendor profile, Profile

**Notifications** (`#/notifications`):
- Header "Notifications", back "/".
- Sub "{n} unread", or "You’re all caught up" when there are none.
- Right button "Mark all read" (only when there are unread notices).
- Items are anchors to `href` (full paths like `/app/#/gig/x`, or "#"). Unread items have a primary border and a green dot (aria "unread").
- Bell icon tile tinted by tone (green, gold or gray), title, body, and a monospace relative time.
- Empty state: "No notifications yet" / "Updates about your gigs, bids and payments will appear here."
- Ad `notifications_bottom`: "Safety first" / "Every gig starts and ends with a one-time code." / CTA "How it works" → `/safety/`.

**Saved providers** (`#/saved`):
- Header "Saved providers", sub "Book people you trust again in one tap."
- 2-column grid of VendorMiniCard (heart unsaves).
- Empty state (heart): "No saved providers" / "Tap the heart on any vendor to save them here." Button "Find vendors" → `#/find`.

**Vendor profile** (`#/vendor/:id`):
- If the user isn't found or isn't a vendor: empty state "Vendor not found", button "Find vendors" → `#/find`.
- Header: title = full name, sub "{trade} · {suburb} area · {km} km away", back "/find".
- Main card:
  - 68px avatar.
  - Short name with the full verified badge (tick plus the word "Verified").
  - Rating.
  - "{completed} gigs completed · {responseRate}% response rate".
  - Bio.
  - Certification badges (shield-check), e.g. "Wireman’s Licence", "Certificate of Compliance (COC) issuer".
- Card "Reviews":
  - Gigs with this vendor that have a review, newest first.
  - Each: requestor short name, stars (size 14), the quoted text, "{gig title} · {relative}".
  - Empty: "No written reviews yet."
- Sticky aside:
  - Rate "/hr" (2xl).
  - "Available now" or "Currently offline".
  - **"Request {short}"** (zap, full width, large, disabled when offline): opens the Request modal (§7) with the vendor's service.
  - **"Save provider"** / **"Saved"** (heart, secondary): toggles saved.

**Profile** (`#/profile`):
- Header "Profile".
- Card:
  - 60px avatar, name.
  - Phone "+27 82 123 4567" (formatted with the regex `(\d{2})(\d{3})(\d{4})`).
  - "Suburb, City".
  - Rating on the right.
- Three stat tiles:
  - "Gigs": count of all the user's gigs (layout-dashboard icon).
  - "Protected": sum of the user's **authorized** payments, i.e. the escrow held (lock icon).
  - "Spent": sum of **captured** payments (star, gold).
- Menu list (divided rows; icon, label, optional note, chevron if it links):
  - "Payment methods" (credit-card icon, inferred), note "Requested only when you book". Not clickable.
  - "Saved providers" (bookmark), note = saved count, → `#/saved`.
  - "Security & privacy" (shield-check) → `/safety/`. This is an absolute path that leaves the SPA.
  - "Notifications" (bell) → `#/notifications`.
  - "24/7 Support" (headset), note "support@gig.demo". Not clickable.
- **"Log out"** (ghost, full width, log-out icon): clears the session → `location.href="/login/"`.

---

## 12. Demo-mode panel (on gig detail, under the status panel)

A dashed card with a flask icon:
- Heading "Demo mode".
- "Testing alone? Play the vendor's next step — or open the other account in the phone preview."
- One secondary small button. Its label depends on the gig state, and the panel is hidden when there is no label:

| State | Button | Effect | Toast |
|---|---|---|---|
| `bidding` | "Simulate a vendor bid" | First simulated eligible vendor without a bid places an auto-bid at 0.97 × budget | "{V} placed a bid." (nothing happens if no vendor is left) |
| `vendor_selected` | "Vendor accepts the request" | → `payment_pending` | "{V} accepted your request." |
| `accepted` | "Vendor starts travelling" | → `traveling`, `etaMinutes` = max(6, round(km × 2.2)) | "{V} started travelling." |
| `traveling` | "Vendor arrives" | → `start_verification`, start OTP generated, stage `arrival_at_location` | "{V} arrived." |
| `start_verification` | "Vendor enters your start code" | Start OTP verified → `active`, stage `inspection` | "{V} entered your start code." |
| `active` + `inspection` | "Vendor finishes inspection" | stage → `gig` | "Inspection completed." |
| `active` + `gig` | "Vendor marks the gig complete" | → `completion_verification` with a completion OTP (instant: 180 min); vendor posts "All done! My completion code is {code}." in chat | "{V} marked the gig complete and sent you the code in Messages." |

There is no button for `payment_pending`, `completion_verification`, `completed` or `cancelled`, because those are the requestor's own steps.

**Side effects of the transitions:**
- **Travel:** notice "{V} is on the way" / "ETA about {n} min."
- **Arrival:**
  - Notice "{V} has arrived" / "Share your start code to begin the job."
  - System message "{V} has arrived. Start code sent to the service requestor."
- **Start verified:**
  - Notice "Gig started" / "Start code verified."
  - System message "Start code verified. The gig has started."
- **Inspection done:** system message "Inspection done. Work in progress."
- **Mark complete:**
  - Notice "{V} marked the gig complete" / "Enter the completion code from your vendor to release payment." (gold).
  - System message "Vendor marked the gig complete. Completion code sent to the vendor."
  - The vendor's code message also triggers the notice "{V} sent the completion code" / "Open the gig to verify completion."

---

## 13. Automatic simulation (scheduled jobs, runner every 1 s)

These are scheduled only when the counterpart is `simulated: true`. Seeded vendor **John (`u_john`) and requestor Alex are not simulated**; all other seeded vendors are.

- **On post:** the first 2 simulated eligible vendors bid after 5 s and 13 s.
  - Amount = budget × 0.94 for the first and × 1.03 for the second, rounded to the nearest R10.
  - ETA = max(15, round(km × 4) + 10).
  - Random note, one of:
    - "Available today — I can bring all materials."
    - "Happy to help, I have done this type of job many times."
    - "Can start as soon as you confirm."
  - A new bid notifies the requestor "New bid received" / "{V} bid on {title}." (gold).
  - If a vendor bids again, their existing pending bid is updated instead of duplicated.
- **With a simulated vendor:**

| Status | Action | Delay |
|---|---|---|
| `vendor_selected` | vendor accepts | 5 s |
| `accepted` | vendor starts travel | 4 s |
| `traveling` | vendor arrives | 10 s |
| `start_verification` | vendor enters the start code | 12 s |
| `active` | next stage or complete (instant 150 min) | 7 s per step |
| `completion_verification` | vendor sends the completion code in chat | 2.5 s |

- Jobs scheduled for a simulated *requestor* (pay, share code, verify, review) are irrelevant for Alex.

---

## 14. Sponsored ad component (shared `b`/`Se`)

- An anchor card: image on the left (w-28 / sm:w-44, `object-position` focus, hover scale 1.03), then the label "SPONSORED" (megaphone, uppercase), the title, the body, and a CTA pill (sm+).
- Records impressions once on mount and clicks on click, in `ads[slot]`.
- Slots used by the requestor app: `home_dashboard_bottom`, `vendor_results_bottom`, `gig_history_bottom`, `notifications_bottom`.

---

## 15. Seed data the requestor sees (`u_alex`)

**`g_active`, GIG-1042 "Electrical installation".**
- Bid mode, John M. (Lyttelton), budget and agreed R1 500, `asap`, 2 photos.
- Status **traveling**: travel started 4 min ago, ETA 12, paid 26 min ago.
- Bids: John R1 500 ETA 30 (accepted, note "Registered electrician, COC included."), Mike R1 600 (rejected).
- Payments: fee captured, bid R1 500 authorized.
- Chat:
  - system: "John M. is booked…"
  - John: "Hi Alex! I've accepted your electrical installation gig."
  - Alex: "Great — when can you arrive?"
  - John: "Leaving now, I'll be there in about 12 minutes."

**`g_bids`, GIG-1044 "Leaking kitchen tap".**
- Plumbing, budget R650, `this_week`, status **bidding**.
- Bids:
  - Thabo S. R600, ETA 30, "I carry common mixer parts, likely a same-visit fix."
  - Bongani K. R550, ETA 45, "Available this afternoon."
- Displayed order: Bongani first (cheapest).

**Five completed gigs, all with reviews:**
- GIG-1031 Interior painting with Sarah, R2 400, 5★
- GIG-1027 Deep clean with Mia, R450, 5★
- GIG-1019 Geyser valve with Thabo, R850, 4★
- GIG-1012 Garden clean-up with Zanele, R600, 5★
- GIG-1004 Couch and fridge move with Kagiso, R900, 5★

**Notices:**
- "John M. is on the way" (unread)
- "New bid received" × 2 (one unread)
- "Payment released to Sarah K."

---

## 16. Not present in this bundle

- **No dispute, support form or reporting flow.** "24/7 Support" is a static row, and there is no `disputed` status. The only post-booking exits are "Cancel gig" (before payment) and OTP resend.
- **No real card entry or payment-method management.** Payment is the fixed "Test card •••• 4242" row.
- **No date or time picker.** Scheduling is only the timing enum (ASAP / This week / Flexible).
- **Photos are a counter**, not uploads.
- **Search by name** exists only as the home search, matching category name, trade or blurb. There is no vendor-name search.

**Timers and animations, collected:**
| What | Timing |
|---|---|
| Gig detail re-render | every 5 s |
| Tracking panel tick | every 1 s |
| Job runner | every 1 s |
| Pay delay | 700 ms |
| Toast lifetime | 3.2 s |
| OTP lifetime | 600 s |

Animations: `animate-spin` (Live badge, waiting states, button loading), `animate-rise` (pages, bid cards, modal, toasts), `animate-pop` (completed check), `animate-blink` (OTP caret), and `active:scale-[.98]` on buttons and 0.90 on stars.
