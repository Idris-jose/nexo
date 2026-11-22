import { getService } from "./services";
import type { Gig, Tone, Viewer } from "./types";

export function timeAgo(at: number): string {
  const min = Math.round((Date.now() - at) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.round(hr / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(at: number): string {
  const d = new Date(at);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtTime(at: number): string {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const fmtPhone = (p: string) => `+27 ${p.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3")}`;

export const hoursLabel = (minutes: number) => (minutes / 60).toFixed(2).replace(/\.?0+$/, "");

export const trade = (slug?: string) => getService(slug)?.trade ?? "Vendor";

export function statusPill(gig: Gig, viewer: Viewer): { text: string; tone: Tone } {
  const req = viewer === "requestor";
  switch (gig.status) {
    // Figma tones: in-progress states are mint, waiting and finished states are grey.
    case "bidding": return { text: req ? "Receiving bids" : "Open", tone: "gray" };
    case "vendor_selected": return { text: req ? "Awaiting vendor" : "New request", tone: "gray" };
    case "payment_pending": return { text: req ? "Confirm payment" : "Awaiting payment", tone: "gray" };
    case "accepted": return { text: "Booked", tone: "green" };
    case "traveling": return { text: "On the way", tone: "green" };
    case "start_verification": return { text: "Verify start", tone: "green" };
    case "active": return { text: "Ongoing", tone: "green" };
    case "completion_verification": return { text: "Verify completion", tone: "green" };
    case "completed": return { text: "Completed", tone: "gray" };
    case "cancelled": return { text: "Cancelled", tone: "gray" };
  }
}

export function gigPrice(gig: Gig): { cents: number; hourly: boolean } {
  if (gig.settlement) return { cents: gig.settlement.serviceCents, hourly: false };
  if (gig.mode === "instant") return { cents: gig.hourlyRateCents ?? 0, hourly: true };
  return { cents: gig.agreedCents ?? gig.budgetCents ?? 0, hourly: false };
}
