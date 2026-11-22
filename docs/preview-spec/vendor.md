I read the full Vendor bundle and resolved every imported identifier through `ui.DbJ6xcJi.js`, `shared.fKynEcgO.js` and `MapCard.lII9uDD-.js`. Nothing was executed and no files were changed.

Two notes before the spec:
- **Routes differ from the guess in the brief.** The app has no `#/jobs` route and no onboarding or verification wizard. The real routes are listed in section 1. Sign-up exists in the store (sets verification to pending), but nothing in the vendor bundle calls it. Verification in this app is read-only status shown on the profile screen.
- **Identifiers.** Below I use readable names, with the minified local name in brackets where it helps tracing.

---

# Vendor App — Functional Spec

## 0. Shell, auth and global behaviour

**Entry and auth gate.** The default export `Ds` wraps the app in a role gate with `role:"vendor"`.
- While mounting it shows a spinner with "Opening Nexo…".
- No session: `location.replace("/login/?next=" + encodeURIComponent(path + search + hash))`.
- Signed in with another role: redirect to that role's root (`/app/`, `/admin/` or `/vendor/`).
- The session user id comes from `?as=<userId>` in the URL first, otherwise `localStorage["gig.demo.session"]`.

**Store.**
- All state lives in `localStorage["gig.demo.state"]` (version 5). It is read through `useSyncExternalStore`.
- Changes from other tabs arrive through the `storage` event.
- If the stored version is newer than 5, the page reloads once (guarded by `sessionStorage["gig.demo.reloaded"]`).

**Hash router.**
- The hash is parsed into `{path, parts, query}`. `#` or empty means `/`.
- On every `hashchange`, the route updates and the page scrolls to the top (`window.scrollTo({top:0})`).
- Navigation helper: `location.hash = to`.
- A `<Redirect to>` component sets the hash in an effect.

**App shell (layout).**
- **Job scheduler:** runs every 1000 ms. It processes due simulated "jobs" (bots acting for the other party).
- **Desktop sidebar** (lg and up, 248px wide):
  - Logo, linking to `/`.
  - All nav items. The active item gets `bg-primary-soft`, and its icon stroke goes from 1.9 to 2.3.
  - Footer buttons:
    - "Reset demo data" (rotate-ccw icon). Shows `confirm("Reset all demo data to the starting state?")`, then rebuilds the seed state.
    - "Log out" (log-out icon). Clears the session, then `location.href="/login/"`.
- **Top header** (sticky, glass style):
  - Logo, shown on mobile only.
  - User's suburb: suburb only on small screens; "Suburb, City" on lg.
  - A "Preview" badge when the URL has `?as=`.
  - Bell button linking to `#/notifications`, with aria-label "Notifications, N unread". A gold unread-count badge appears when the count is above 0.
  - Avatar (initials, hue gradient) plus `short` name plus role label "Vendor". Links to `#/profile`.
- **Main area:** `max-w-6xl`. Content is wrapped in `animate-rise` and keyed by path, so the animation replays on every route change.
- **Mobile bottom nav** (below lg):
  - The first two `mobile` items, then a centre FAB, then mobile items 3–4.
  - FAB: `{to:"/opportunities", label:"Gigs", icon: zap}`. It is a 56px green rounded square raised `-mt-7`, with a cream border.
- **Toasts:** bottom-centre (`bottom-24`, or `bottom-6` on lg), dark pill, `animate-rise`. Each one disappears after 3200 ms.

**Nav items** (`vs`, in this order):

| Label | Icon (lucide) | Route | Mobile | Active match |
|---|---|---|---|---|
| Dashboard | house | `/` | yes | `path==="/"` |
| Opportunities | search | `/opportunities` | no | path starts with `/opportunit` |
| My Gigs | briefcase | `/gigs` | yes | starts with `/gigs` or `/job/` |
| Earnings | wallet | `/earnings` | yes | default rule |
| Messages | message-circle | `/messages` | no | default rule |
| Reviews | star | `/reviews` | no | default rule |
| Profile & Verification | user | `/profile` | yes | default rule |

The default rule is: `path===to`, or (`to!=="/"` and path starts with `to`).

On mobile the bottom bar therefore reads: **Dashboard, My Gigs, [FAB "Gigs"], Earnings, Profile & Verification**.

**Route table** (`bs`, based on `parts[0]` and `parts[1]`):
- `/` → Dashboard
- `opportunities` → Opportunities list
- `opportunity/:id` → Opportunity detail / bid
- `job/:id` → Job detail
- `gigs` → My gigs
- `earnings` → Earnings
- `reviews` → Reviews
- `messages` and `messages/:gigId` → shared Messages screen (`viewer:"vendor"`)
- `notifications` → shared Notifications screen (`back:"/"`)
- `profile` → Profile & verification
- Anything else → empty state "Page not found" (search icon), with a "Dashboard" button linking to `#/`.

**Helpers**
- **Is verified:** `user.verification?.identity === "verified"`.
- **Trade name:** the trade for the user's service (for example "Electrician"); falls back to "Vendor".
- **Service catalogue:**

| slug | name | trade |
|---|---|---|
| electrical | Electrical | Electrician |
| plumbing | Plumbing | Plumber |
| cleaning | Cleaning | Cleaner |
| painting | Painting | Painter |
| moving | Moving | Mover |
| repairs | Repairs | Handyman |
| gardening | Gardening | Gardener |
| tutoring | Tutoring | Tutor |
| massage | Massage | Massage therapist |
| events | DJ & Events | (not read) |

- **Areas:** Pretoria-region suburbs, each with lat/lng: hatfield, arcadia, sunnyside, brooklyn, menlopark, waterkloof, and also centurion and midrand.
- **Distance:** haversine distance, rounded to the nearest 0.5 km, minimum 0.5.
- **Money format:** `"R" + narrow space + thousands separated by narrow spaces`. Cents are shown as `,cc` only when non-zero. Example: `R 1 200`.
- **Relative time:**
  - under 1 min: "just now"
  - under 60 min: "N min ago"
  - under 24 h: "N hr ago"
  - 1 day: "yesterday"
  - otherwise: "N days ago"
- **Date format:** `"D Mon YYYY"`.
- **Timing labels:** asap = "ASAP", this_week = "This week", flexible = "Flexible".
- **Constants:**
  - Service fee: R20 (2000 cents).
  - Commission: 300 bps (3%), rounded as `floor((amt*300+5000)/10000)`.
  - Billing step: 15 minutes, minimum 60 minutes.
  - Radius: 30 km.
  - OTP: `{ttlSeconds:600, maxAttempts:5, maxResends:3}`. Codes are 6-digit, from `crypto.getRandomValues`.

**Status labels** (vendor viewpoint), shown as a badge with a tone:

| status | text | tone |
|---|---|---|
| bidding | "Open" | gold |
| vendor_selected | "New request" | gold |
| payment_pending | "Awaiting payment" | gold |
| accepted | "Booked" | green |
| traveling | "On the way" | green |
| start_verification | "Verify start" | gold |
| active | "In progress" | green |
| completion_verification | "Verify completion" | gold |
| completed | "Completed" | green |
| cancelled | "Cancelled" | gray |

**Status groups.**
- Active statuses: `accepted, traveling, start_verification, active, completion_verification`.

**Shared data selector** (`$e(user)`):
- `opportunities`: gigs with `status==="bidding"`, `mode==="bid"`, same service as the user, `requestorId !== user.id`, and distance at most 30 km. Sorted newest first by `createdAt`.
- `requests`: gigs with `vendorId === me` and `status==="vendor_selected"`. These are instant requests.
- `jobs`: gigs with `vendorId === me` and status in the active group or `payment_pending`.
- `myBids`: all bids where `vendorId === me`.

---

## 1. Dashboard `#/`

**Header**
- Heading (h1): greeting chosen by the local hour: under 12 "Good morning", under 18 "Good afternoon", otherwise "Good evening". Then `", " + firstName + "!"`.
- Subtitle: "Here are your latest opportunities."
- On the right: the **Online status card**, described below.

**Online status card** (also used on the Opportunities screen)
- Container is a rounded box:
  - Online: `border-primary/30 bg-primary-soft`, with a green dot and a ring.
  - Offline: white background with a muted dot.
- Title: "You are online" or "You are offline".
- Subline: "Receiving gigs nearby" or "Not receiving gigs".
- Toggle switch (aria-label "Online"; size 56×32, knob moves from left-1 to left-7).
  - On change: sets `user.online`.
  - Toast: "You’re online" or "You’re offline" (curly apostrophe).

**Verification banner** (shown when the user is not verified; also on Opportunities)
- Yellow box with a shield-check icon.
- Title: "Verification pending".
- Text: "You’ll receive gigs once your ID is verified. (Demo: sign in as Admin to approve.)"
- Button: "Details" (small, secondary), links to `#/profile`.

**Stat tiles** (2 columns, 4 on lg)
1. Icon from the trending-up chunk (export `B`; exact name unresolved). Value: `fmt(lifetimeCents ?? 0)`. Label: "Total earnings".
2. circle-check icon. Value: `user.completed`. Label: "Completed gigs".
3. star icon, gold tone. Value: `rating.toFixed(1)` or "—". Label: "Average rating".
4. trending-up icon. Value: `${responseRate ?? 100}%`. Label: "Response rate".

**Main column**
- **"Instant requests"** section (only when `requests.length > 0`). Each request is an *Instant request card*:
  - The card has a gold ring.
  - Service tile, title, and a gold "Instant" badge with a zap icon.
  - Meta line: `requestor.short · suburb · X km · timingLabel`.
  - Description text.
  - Right side: `hourlyRateCents` with a "/hr" suffix.
  - **Accept** button (check icon): accepts the request, toast "Accepted — waiting for payment", then navigates to `/job/:id`.
  - **Decline** button (secondary): declines the request, toast "Request declined".
- **"Active jobs"** section (only when `jobs.length > 0`). Each job is a gig row:
  - Service tile, title, and subline `requestor.short · suburb`.
  - Right side: amount `agreedCents ?? hourlyRateCents ?? 0`, with "/hr" when `mode==="instant"`, plus a status badge.
  - The row links to `#/job/:id`.
- **"New opportunities"** section. A "See all" header link goes to `#/opportunities`. Below it is the Opportunity list (described next) with the first 5 opportunities.

**Opportunity list**
- Empty state (search icon), title "No open gigs right now". Body:
  - Online: "New gigs within 30 km will appear here instantly."
  - Offline: "Go online to receive gigs."
- Otherwise a card with dividers. Each row has:
  - Service tile (42).
  - A link to `#/opportunity/:id` showing the title and the meta line: map-pin icon, `suburb · X km · relativeTime(createdAt)`.
  - Budget `fmt(budgetCents ?? 0)`, right-aligned, width w-24.
  - Buttons: "View" (secondary) and a second button showing "Bid" (primary) or, if I already have a pending bid on this gig, "Bid sent" (soft). Both buttons link to `#/opportunity/:id`.

**Aside (340px on xl)**
- **Wallet card:**
  - "Wallet balance"
  - `fmt(walletCents)` in large text.
  - `"{n} pending bid|bids · {jobs.length} active"`, where n counts my bids with status pending.
  - "View earnings" button (soft, small), links to `#/earnings`.
- **"Recent reviews" card:**
  - Shows the 3 most recent reviews on my gigs, sorted by `review.at` descending.
  - Each one: star display (size 14), the quoted text `“…”`, and `"— {requestor.short} · {relativeTime}"`.
  - Empty: "Reviews from completed gigs appear here."

**Bottom:** sponsored ad, slot `provider_dashboard_bottom`.
- It counts one impression on mount and one click on each click.
- Content: "Sponsored" (megaphone icon) / "Grow with Nexo Promotions" / "Boost your profile in nearby search results." / CTA "Learn more", linking to `/vendor/#/profile`.
- Image: `/ads/promote.jpg`, alt "Smiling woman holding her smartphone", objectPosition `50% 28%`. The image scales to 1.03 on hover.

---

## 2. Opportunities `#/opportunities`

- Page header:
  - Title: "Opportunities".
  - Sub: `"{serviceName} gigs within 30 km of {mySuburb}"`.
  - Right side: Online status card.
- Verification banner if not verified.
- Instant request cards (same as the Dashboard), when there are any.
- Opportunity list with *all* opportunities (no limit of 5).
- Lock-icon info note: "Exact addresses are hidden until you are booked. You see the suburb and your distance only."

---

## 3. Opportunity detail and bid `#/opportunity/:id`

**State**
- Amount string defaults to `String((existingBid?.amountCents ?? gig.budgetCents ?? 0)/100 | 0)`.
- ETA defaults to `existingBid?.etaMinutes ?? 30`.
- Note defaults to `existingBid?.note ?? ""`.
- An error message field.
- "Existing bid" means my bid on this gig with any status except withdrawn.

**Guards**
- Gig not found: empty state "Opportunity not found" with a "Back to opportunities" button linking to `#/opportunities`.
- If `gig.vendorId === me` and the status is no longer bidding: redirect to `/job/:id`.

**Page header**
- Title: `gig.title`.
- Sub: `"Posted by {requestor.short} · {relativeTime} · {gig.ref}"`. The ref has the form `GIG-n`.
- "← Back" link to `#/opportunities`.

**Left column**
- Card:
  - Badges: "Bid flow" (gold, gavel icon) and the timing label (gray).
  - Budget in a 3xl number, with the caption "Budget (total)".
  - Key/value rows: "Category" = service name; "Area" = `"Suburb, City"`; "Distance" = `"X km"`.
  - "Work description" label, then the description.
  - If `photos > 0`: that many 80×80 placeholder tiles (diagonal stripe gradient, camera icon).
- Map card:
  - Centred on the gig area.
  - `spanKm = max(10, distance*1.4)`, height h-52.
  - Markers: destination pin (label "Approximate area") and a "you" dot.
  - Caption: "Approximate area — exact address after booking".
- Demo-mode panel (see section 11).

**Right column (sticky card)**
- Title: "Your bid" if an existing bid exists, otherwise "Place a bid".
- If `gig.status !== "bidding"`: "This gig is no longer taking bids", followed by " — the requestor chose another vendor." if my bid was rejected, otherwise ".".
- Else, if I am **eligible** — role vendor, account status active, same service, identity verified, online, within 30 km, and not the requestor — show the form:
  - **"Bid amount"** (`#amt`):
    - Input prefixed with "R", `inputMode=numeric`.
    - Non-digits are removed while typing; typing clears the error.
    - Parsed amount = `Number(value without non-digits) * 100` cents.
  - **Quick-pick chips** (3 columns). With P = budget in cents, the values in rand are:
    - `round(P*0.9/1000)*10` (about 90%, rounded to R10)
    - `round(P/100)` (the budget)
    - `round(P*1.1/1000)*10` (about 110%)
    - Each chip label is `fmt(x*100)`. Clicking sets the amount. The chip whose value equals the amount gets primary styling.
  - **"Estimated arrival"** (`#eta`):
    - Select with values 15, 30, 45, 60, 90, 120.
    - Labels: "15 min", "30 min", "45 min", then "1 hr", "1.5 hr", "2 hr" (`x/60` hr).
  - **"Note (optional)"** (`#nt`):
    - Textarea, 2 rows, not resizable.
    - Placeholder: "e.g. I carry the parts needed".
  - **Payout preview** (when the amount is above 0): "You’ll receive **{fmt(amount − 3%)}** after the 3% commission."
  - **Submit button** (large, full width, gavel icon). Label: "Update bid" if my existing bid is pending, otherwise "Place bid".
    - Validation:
      - Amount is 0 or empty: "Enter your bid amount".
      - Amount above 10,000,000 cents: "Bid must be under R100 000".
    - Calls the place-bid action `(vendorId, gigId, cents, eta, note.trim() || undefined)`.
    - Toast: "Bid updated" if an existing bid exists, otherwise "Bid sent — the requestor is notified".
    - Store behaviour:
      - The store re-checks status and eligibility.
      - If I already have a pending bid, it updates amount, ETA and note in place.
      - Otherwise it creates a bid `{status:"pending", createdAt}` and notifies the requestor "New bid received" / "{short} bid on {title}." (gold).
      - If the requestor is simulated, it schedules `requestor_accept_bid` in 8 seconds.
  - **When my bid is pending**, below the button:
    - A spinning loader with "Waiting for {requestor.short}…".
    - A "Withdraw bid" ghost button: sets the bid to withdrawn, toast "Bid withdrawn".
- If not eligible:
  - Offline: "Go online to bid on gigs."
  - Online but not verified: "Complete verification to bid."
  - Online and verified: "This gig is outside your area or service."

**No separate standard-rate path.** Bid gigs (`mode:"bid"`) only take a custom amount, with the budget-based chips as presets. Fixed hourly-rate gigs are the "instant" flow, which the vendor accepts or declines; there is no bidding on them.

---

## 4. Job detail `#/job/:id`

- Re-renders every 1000 ms, which drives the OTP countdowns.
- **Guards:**
  - The gig must have `vendorId === me`.
  - If not, and a gig with this id is still bidding: redirect to `/opportunity/:id`.
  - Otherwise: empty state "Job not found" with a "My gigs" button linking to `#/gigs`.
- **Header:**
  - "← My gigs" link to `#/gigs`.
  - Service tile (46) and the title as h1.
  - Subline: `"{ref} · for {requestor.short} · "`, then `"bid R X"` (agreed amount) for bid gigs or `"R X/hr"` for instant gigs.
  - Status badge.
- **Address released** = `addressReleasedAt` is set and the status is not vendor_selected, payment_pending or bidding.

**Left column:** the status panel (below), then the Demo-mode panel.

**Right column**
- **"Destination" card:**
  - Released: map-pin icon plus `gig.address`; an "Open in Maps" button (navigation icon) linking to `https://www.google.com/maps/search/?api=1&query=<encoded address>`; and the note "Released to you only — because you are the assigned vendor."
  - Not released: lock info note `"{suburb}, {city} · X km. The exact address is released once the requestor pays."`
  - Then the "Work description" label and the description.
- **"Chat with {requestor.short}"** card (only when released): embedded chat, described in section 8.

**Status panel, per `gig.status`**

`hours` state is initialised once at mount: `max(1, round(hoursSince(startedAt)*4)/4) || 1`. If `startedAt` is missing this is 1.

**`vendor_selected`**
- Card title: "New instant request".
- Text: "{short} wants to book you at R X/hr. The first hour is paid when you accept and they confirm."
- **Accept** (check icon): accepts the request, toast "Accepted — waiting for payment".
  - Store: status becomes payment_pending; the requestor is notified "{vendor} accepted your request" / "Confirm payment to book them." (gold).
- **Decline** (secondary): declines the request, toast "Request declined", then navigates to `/`.
  - Store: status becomes cancelled with `cancelledAt`; the requestor is notified "Vendor unavailable" / "{short} can't take {title}. Try another vendor."

**`payment_pending`**
- Centred spinner (size 30).
- "Waiting for {short} to pay".
- "You’ll get the exact address as soon as payment is confirmed."

**`accepted`**
- Green 64px circle with a check icon and the `animate-pop` animation.
- "Gig accepted!"
- "{short} has been notified. Payment is protected until completion."
- Cream box with one row:
  - Bid gig: "You’ll earn (after 3%)" = agreed amount minus commission (bold).
  - Instant gig: "Your rate" = "R X/hr".
- **"Start travelling"** (large, navigation icon): toast "{short} can see you’re on the way".
  - Store: status becomes traveling; sets `travelStartedAt`; `etaMinutes = max(6, round(distance*2.2))`. The requestor is notified "{v} is on the way" / "ETA about N min."

**`traveling`**
- Map card:
  - Centred on the gig area, `spanKm` 12, height h-72.
  - Markers: destination pin and "you" dot.
  - Route curve from my area to the gig area, with the progress dot fixed at 0.5. There is no animation.
  - Caption: "Navigation".
- Card:
  - Badge "You’re on your way" (navigation icon).
  - "X km · about {etaMinutes} min. Tap below when you’re at the door — {short} will receive a start code."
  - **"I’ve arrived"** (full width, map-pin icon): toast "Start code sent to the requestor".
  - Store: status becomes start_verification; stage becomes arrival_at_location; sets `arrivedAt`.
  - Creates `startOtp = {code, expiresAt: now+600s, attempts:0, resends:0}`.
  - Notifies the requestor "{v} has arrived" / "Share your start code to begin the job."
  - Adds a system chat message: "{v} has arrived. Start code sent to the service requestor."

**`start_verification`**
- Badge "Arrived" (map-pin icon).
- "Enter the start code".
- "Ask {short} for the 6-digit code on their phone. It confirms the gig has started."
- **6-digit code input:**
  - Hidden input with `autoComplete=one-time-code`; it autofocuses, keeps digits only, and allows at most 6.
  - Shows 6 boxes. The focused box shows a blinking caret (`animate-blink`). Boxes get a red border when the code is invalid.
  - Typing clears the error.
- Error line (alert icon), shown when there is an error.
- **"Verify start"** (large, shield-check icon). Disabled until the code has 6 digits.
  - Success: toast "Verified — you can begin".
  - Store on success: status becomes active; stage becomes inspection; sets `startedAt`. The requestor is notified "Gig started" / "Start code verified." System chat message: "Start code verified. The gig has started."
  - Failure: shows the error and clears the input.
  - Possible errors:
    - "This code has expired. Ask for a new one."
    - "Too many attempts. Request a new code."
    - "That code doesn't match. N tries left." (or "1 try left")
    - "This gig is not waiting for a start code."
- Footer: `"Code expires in M:SS · {5 − attempts} attempts left"`. M:SS = `floor(s/60):pad2(s%60)`, counted down to 0 and refreshed every second.

**`active`**
- "Job progress".
- "Update each step as you go — {short} tracks this live."
- **Stage stepper** (vertical):
  - Steps: "Arrival at Location", "Inspection", "Gig", "Gig Completed".
  - Each step shows "Completed", "In progress" or "Pending". Done steps get a check circle and a green connector line.
  - Index rules: `s` = 4 if completed, otherwise the index of the current stage.
    - Done up to: −1 when start_verification, 2 when completion_verification, otherwise `s−1`.
    - Current step: 0 when start_verification, 3 when completion_verification, otherwise `s`.
- If `stage==="inspection"`: **"Inspection done — start the gig"** (full width, check icon). No toast.
  - Store: stage becomes gig. System message: "Inspection done. Work in progress."
- Else, when the stage is "gig":
  - Instant gigs only: **"Time on site"** select (`#hrs`).
    - Options: 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 8.
    - Labels: `"{h} hour|hours — {fmt(round(hourlyRate*h))}"`.
    - Hint: "Billed per 15 minutes, minimum 1 hour. The first hour is already paid."
  - **"Mark Gig Completed"** (full width, circle-check icon). It passes `round(hours*60)` for instant gigs and nothing for bid gigs. Toast: "Completion code generated".
  - Store: status becomes completion_verification; sets `completeMarkedAt`.
    - Instant gigs: `actualMinutes = passed value ?? max(60, minutes since startedAt)`.
    - Creates `completionOtp` (600 s).
    - Notifies the requestor "{v} marked the gig complete" / "Enter the completion code from your vendor to release payment." (gold).
    - System message: "Vendor marked the gig complete. Completion code sent to the vendor."

**`completion_verification`**
- Gold badge "Marked complete" (circle-check icon).
- "Give {short} this completion code".
- "Once they’re happy with the work they enter it on their phone — that releases your payment."
- The code in 6 bordered digit boxes. Aria-label: "Code d d d d d d".
- "Expires in M:SS" with a timer icon.
- **"Issue a new code"** (ghost, small): resends the code.
  - Toast: "New completion code issued", or the error: "Resend limit reached. Contact support." (maximum 3 resends) or "No code to resend."
  - A new code resets attempts and the 600 s expiry, and increments `resends`.

**`completed`**
- Yellow 64px circle with a wallet icon and `animate-pop`.
- Badge "Payment released" (check icon).
- `settlement.payoutCents` in 4xl text.
- "Paid to your wallet".
- Settlement card (vendor view):
  - "Service amount" = `serviceCents`.
  - Instant gigs: muted row "Billed time (X h)" = `serviceCents`, where X is the billable minutes / 60 to 2 decimals with trailing zeros stripped.
  - "Nexo commission (3%)" = "– R X" (muted).
  - Divider, then "You received" = payout (bold).
- "Review from {short}" card: star display (size 18) plus the quoted text, or "Waiting for their review."

**`cancelled`**
- Empty state with an x icon: "This gig was cancelled".

**Completion settlement (store, triggered by the requestor's code)**
- Bid gigs:
  - service = agreed amount; commission = 3%; payout = service − commission; requestor total = service + R20.
  - The `bid_amount` payment moves to captured.
- Instant gigs:
  - billable = `max(60, ceil(actualMinutes/15)*15)`.
  - service = `floor((rate*billable+30)/60)`.
  - firstHour = rate; remaining = service − rate. A `remaining_hours` payment is captured when remaining > 0.
- Then:
  - Vendor `completed += 1`; lifetime and wallet each increase by the payout.
  - Requestor `completed += 1`.
  - A payout record is created: `{title, grossCents, commissionCents, netCents, status:"paid"}`.
  - System message: "Completion verified. Payment released to the vendor."
  - Vendor notification: "Payment released" / "{title} · you received your payout." (gold).

**Payment confirmation (requestor side, affects the vendor)**
- Status becomes accepted; sets `paidAt` and `addressReleasedAt`.
- Bid gigs: the selected bid becomes accepted. Other pending bids become rejected, and those vendors are notified "Bid not selected" / "{title} went to another vendor."
- The vendor is notified: "You won the bid!" (bid gigs) or "Booking confirmed" (instant), with "{req} confirmed {title}. The exact address is now available."
- System message: "{v} is booked. Payment is protected until service completion."

---

## 5. My gigs `#/gigs`

- Header: "My gigs" / "Jobs, bids and history."
- Segmented tabs (default **active**):
  - `Active (n)`: gigs where I am the vendor and status is active-group, payment_pending or vendor_selected.
  - `Bids (n)`: my pending bids, paired with their gig.
  - `Completed (n)`: my gigs with status completed.

**Active tab**
- Gig rows linking to `#/job/:id`.
- Amount `agreed ?? hourly`, with "/hr" for instant gigs.
- Sub: `"{requestor.short} · {suburb}"`.
- Empty state (briefcase icon): "No active jobs" / "Win a bid or accept an instant request to start." with a "Find opportunities" button linking to `#/opportunities`.

**Bids tab**
- Rows linking to `#/opportunity/:gigId`.
- Amount = bid amount.
- Sub: `"Your bid · ETA {eta} min · {relativeTime(createdAt)}"`.
- Badge = the gig's status ("Open").
- Empty state (gavel icon): "No pending bids".

**Completed tab**
- Rows linking to `#/job/:id`.
- Amount = payout from the settlement.
- Sub: `"{requestor.short} · {D Mon YYYY of completedAt}"`.
- Empty state (circle-check icon): "No completed gigs yet".

---

## 6. Earnings `#/earnings`

- Header: "Earnings" / "Payouts land in your wallet when completion is verified."
- Two columns on xl.

**Left column**
- Green hero card:
  - "Available balance"
  - `fmt(walletCents)` in 4xl.
  - Button with a wallet icon: "Withdraw to FNB •• 8821". It is white and full width, and disabled (50% opacity) when the wallet is 0.
    - On click: toast "Withdrawal requested".
    - Store: adds a payout `{title:"Withdrawal to FNB •• 8821", gross: wallet, commission: 0, net: −wallet, status:"processing"}` and sets the wallet to 0.
    - Self-notification: "Withdrawal requested" / "Funds usually reflect within 1–2 business days." (gray).
- Four tiles (2 columns). "This month" means payouts from the 1st of the current month with net > 0.
  - "This month": sum of net.
  - "Rating": rating to 1 decimal, or "—" (gold).
  - "Paid gigs this month": count.
  - "Nexo commission": "3%".

**Right column**
- "Recent payouts" list, all of my payouts, newest first. Empty state (wallet icon): "No payouts yet".
- Each row:
  - Wallet icon tile: yellow when net > 0, gray otherwise.
  - Title.
  - Meta line: `"D Mon YYYY"`, plus `" · gross R X · fee R Y"` when there is commission, plus `" · processing"` when processing.
  - Right side: "+R X" (green) or "–R X" (muted).

---

## 7. Reviews `#/reviews`

- Header: "Reviews" / `"{rating to 1 decimal or —} average from {reviewCount} reviews"`.
- Empty state (star icon): "No reviews yet" / "Reviews appear after verified completion."
- Otherwise a grid (2 columns on sm), newest first. Each card:
  - Avatar (40) of the requestor.
  - `short`, then `"{gig title} · {relativeTime}"`.
  - Star display (size 14).
  - The quoted text.
- The store recomputes the rating as a running average rounded to 0.1. Each new review notifies me "New N-star review" with the review text, linking to `/vendor/#/reviews`.

---

## 8. Messages `#/messages` and `#/messages/:gigId` (shared component)

- **Conversation list:** gigs that have a vendor, where I am requestor or vendor, and whose status is not bidding, vendor_selected or cancelled. Sorted by last message time, falling back to `gig.createdAt`.
- Header: "Messages" / "Conversations are tied to your gigs."
- Empty state (message-circle icon): "No conversations yet" / "Once a gig is booked you can message each other here."
- Each row links to `#/messages/:id`: avatar, other party's short name, time of the last message (relative), gig title, and the last message text or "Say hello 👋".
- **Thread view:**
  - Unknown id: "Conversation not found" with an "All messages" button.
  - "←" back link, avatar (40), the other party's short name, and a link to `#/job/:id` reading "{title} · {ref}".
  - The message pane auto-scrolls to the bottom when a new message arrives.
    - System messages (`fromId:null`) are centred green pills.
    - My messages are right-aligned green bubbles.
    - The other party's messages are left-aligned white bubbles.
    - Each bubble shows the time as HH:MM.
  - Form:
    - Input (`#msg`, sr-only label "Message", placeholder "Message…").
    - Send button (send icon, aria "Send"; the text "Send" shows on sm and up). Disabled when the input is blank.
    - Sending trims the text and notifies the other party "Message from {short}" with the first 80 characters, linking to `/vendor/#/messages/:id` or `/app/#/messages/:id`.
  - Embedded mode (inside Job detail): no header, max-h-80.

---

## 9. Notifications `#/notifications` (shared)

- Header:
  - Title: "Notifications".
  - Sub: "N unread" or "You’re all caught up".
  - "← Back" link to `#/`.
  - "Mark all read" button (small, secondary), shown only when there are unread notices.
- Empty state (bell icon): "No notifications yet" / "Updates about your gigs, bids and payments will appear here."
- List items link to `notice.href`:
  - Icon tile tone: gold, gray or green.
  - Title, plus a green dot when unread.
  - Body.
  - Relative time in mono font.
  - Unread items get `border-primary/30`.
- Bottom ad, slot `notifications_bottom`: "Safety first" / "Every gig starts and ends with a one-time code." / "How it works", linking to `/safety/`.
- Vendor notifications that come from the store:
  - "New gig near you": `{title} · {suburb} · X km`, linking to `/vendor/#/opportunity/:id`. Sent when a gig is posted, to eligible vendors.
  - "You won the bid!" / "Booking confirmed"
  - "Bid not selected"
  - "{req} sent the start code" / "Code: XXXXXX" (simulated requestor)
  - "Payment released"
  - "New N-star review"
  - "Withdrawal requested"
  - "Request cancelled"
  - "Message from …"
  - "You are verified" / "Verification unsuccessful" (sent by the admin action)
  - "Welcome to Nexo, {first}" (sent at sign-up)

---

## 10. Profile & verification `#/profile`

- Header: "Profile & verification".
- Two columns on lg.

**Left column**
- Profile card:
  - Avatar (64).
  - Name, plus a badge-check icon when verified.
  - `"{trade} · {suburb}"`.
  - Rating: star + value to 1 decimal + "(count)", or "New" when there is no rating.
  - Bio paragraph (if set).
  - Key/value rows: "Hourly rate" = "R X/hr" (`rateCents`; new vendors default to R200); "Service radius" = "30 km"; "Completed gigs".
- Availability card:
  - Power icon, "Availability".
  - "Online — receiving gigs" or "Offline".
  - Toggle (aria "Online"): sets online. **No toast here**, unlike the Dashboard toggle.

**Right column**
- "Verification" card. Three rows, each with an icon tile, a label and a status badge. The badge text is the raw status (`verified`, `pending`, `rejected` or `unverified`) with tone green, gold, red or gray respectively.
  - identity: "Identity (SA ID)", badge-check icon.
  - address: "Proof of address", house icon.
  - skills: "Skills & certificates", file-text icon.
  - Certifications appear as green badges with a shield-check icon, when there are any.
  - Footnote: "Documents are stored privately and reviewed by the Nexo trust team."
  - There are no upload controls. Admin approval sets all three statuses at once.
- "Advertising performance" card (megaphone icon), based on the `provider_dashboard_bottom` ad:
  - "Impressions"
  - "Clicks"
  - "CTR" = `clicks/impressions*100` to 1 decimal, with "%", or "0%".
- Buttons (2 columns):
  - "Support" (secondary, phone icon): toast "Support: support@gig.demo".
  - "Log out" (ghost, log-out icon): clears the session, then `location.href="/login/"`.

**New vendor defaults (sign-up)**
- `service` defaults to "repairs"; `rateCents` 20000; `online:false`; `responseRate:100`.
- `verification:{identity:"pending", address:"unverified", skills:"unverified"}`.
- `certifications:[]`, lifetime 0, wallet 0, rating 0, `reviewCount` 0, completed 0.

---

## 11. Demo-mode panel (on Opportunity detail and Job detail)

- Dashed card:
  - "Demo mode" (flask icon).
  - "Testing alone? Play the service requestor's next step — or open the other account in the phone preview."
  - One secondary button that performs the simulated requestor step and shows the result as a toast.
- Button labels (vendor viewer):

| Situation | Button | Toast after the step |
|---|---|---|
| bidding, and I have a pending bid | "Requestor accepts your bid" | "{req} accepted your bid and paid." (bid is selected and payment confirmed) |
| payment_pending | "Requestor confirms payment" | "{req} confirmed payment." |
| start_verification | "Requestor sends you the start code" | "{req} sent you the start code in Messages." (adds a chat message "Hi! My start code is XXXXXX." and a notification) |
| completion_verification | "Requestor verifies completion" | "{req} verified completion — payment released." |
| completed with no review | "Requestor leaves a review" | "{req} left a 5-star review." (text "Excellent service, thank you!") |

- In any other state the panel is hidden.

**Background bots** (simulated counterparts, polled every 1 s)
- Auto-accept of my bid: 8 s.
- Requestor pays: 4 s.
- Requestor shares the start code: 3.5 s.
- Requestor verifies completion: 8 s.
- Requestor leaves a review: 5 s. The review is 5 stars with one of:
  - "Professional, on time and tidy. Highly recommend."
  - "Great work — will book again."
  - "Friendly and efficient. Thank you!"

---

## 12. Map card details

- A stylised SVG, not a real map. Viewbox 400×240 with:
  - a 28px grid pattern,
  - green park shapes,
  - a blue river,
  - white roads.
- **Positioning:** equirectangular, 111 km per degree, scaled to `spanKm`, clamped 18px from the edges.
- **Markers:**
  - destination: map-pin icon (34px, filled).
  - you: 16px green dot with a ring; tooltip "Your area".
  - person: initials circle.
- **Route:** quadratic Bézier from → to, with the control point at the midpoint +40 x / −30 y. Drawn as a translucent 10px stroke under a 4px stroke. A progress dot sits on the curve at `t = progress`.
- **Caption:** glass pill in the bottom-left corner with a camera icon (as imported by MapCard).

---

## 13. Timers and animations summary

- **1 s ticks:**
  - The job scheduler, in the shell.
  - Re-rendering of Job detail, which drives "Code expires in M:SS".
- **Toast:** stays for 3.2 s, `animate-rise`.
- **Page transition:** `animate-rise` on every route change.
- **`animate-pop`:** the success circles for "Gig accepted!" and "Payment released".
- **`animate-spin`:** loaders for "Waiting for {req} to pay", "Waiting for {req}…" (pending bid), and button loading states.
- **`animate-blink`:** caret in the OTP input.
- **Buttons:** `active:scale-[.98]`.
- **Cards with a link:** lift on hover (`-translate-y-px`).
- **Ad image:** scales to 1.03 on hover (500 ms).
- **Toggle knob:** transitions left-1 → left-7.
- **No animation** on the traveling map; progress is fixed at 0.5.

---

## 14. Unresolved

- **`be` stat icon** (Dashboard "Total earnings", Earnings "This month"): it is export `B` of `trending-up.Cm1OTPJp.js`, which was not downloaded, so its icon name is unknown. Possibly banknote or similar.
- **`index.-iFofLld.js`** only supplies React (`r` → React).
