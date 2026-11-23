import type { User } from "./types";

/**
 * Proof of work shown on a vendor's profile: photos from past jobs.
 * Looked up by vendor id / service (like photos.ts) so existing demo state in localStorage picks it up without a migration.
 * `photo` is a path under /public; items without one render a branded placeholder tile.
 */
export interface WorkItem {
  title: string;
  detail: string;
  photo?: string;
}

const BY_SERVICE: Record<string, WorkItem[]> = {
  electrical: [
    { title: "DB board replacement", detail: "Old fuse box swapped for a 12-way board with earth leakage.", photo: "/work/electrical/1.jpg" },
    { title: "Kitchen downlights", detail: "Eight LED downlights on two switched circuits.", photo: "/work/electrical/2.jpg" },
    { title: "Outdoor plug points", detail: "Weatherproof outlets for a patio, COC issued.", photo: "/work/electrical/3.jpg" },
    { title: "Fault finding", detail: "Tripping circuit traced to a damaged geyser element.", photo: "/work/electrical/4.jpg" },
  ],
  plumbing: [
    { title: "Geyser replacement", detail: "150 L geyser with new drip tray and vacuum breakers." },
    { title: "Burst pipe repair", detail: "Copper section replaced under the kitchen sink." },
    { title: "Blocked drain", detail: "Main line cleared and rodded, camera checked." },
  ],
  cleaning: [
    { title: "Move-out deep clean", detail: "3-bed house, ovens, windows and grout." },
    { title: "Post-renovation clean", detail: "Dust and paint spots cleared from a new kitchen." },
    { title: "Weekly home clean", detail: "Regular client since 2024." },
  ],
  painting: [
    { title: "Lounge feature wall", detail: "Two coats, clean cut-in lines along the ceiling." },
    { title: "Exterior repaint", detail: "Crack repair, primer and two coats on a double storey." },
    { title: "Kids' bedroom", detail: "Low-VOC paint, done in a day." },
    { title: "Wooden deck", detail: "Sanded and sealed." },
  ],
  repairs: [
    { title: "Built-in shelving", detail: "Floating shelves for a study nook." },
    { title: "Sticking doors", detail: "Rehung and planed three interior doors." },
    { title: "Cupboard hinges", detail: "Soft-close hinges fitted throughout a kitchen." },
  ],
  moving: [
    { title: "2-bed apartment move", detail: "Hatfield to Centurion, done in one trip." },
    { title: "Fridge delivery", detail: "Collected from the store and carried up three floors." },
  ],
  gardening: [
    { title: "Garden clean-up", detail: "Overgrown beds cleared, 6 bags of refuse removed." },
    { title: "New lawn", detail: "Instant lawn laid on a prepared bed." },
  ],
  tutoring: [
    { title: "Matric maths", detail: "Learner improved from 48% to 71% in two terms." },
    { title: "Grade 10 science", detail: "Weekly sessions and exam prep." },
  ],
  massage: [
    { title: "Sports massage", detail: "Recovery sessions for a running club." },
    { title: "Mobile setup", detail: "Table, linen and oils brought to the client." },
  ],
  events: [
    { title: "Wedding reception", detail: "150 guests, sound and lighting." },
    { title: "Year-end function", detail: "Corporate event, 5-hour set." },
  ],
  admin: [
    { title: "SARS eFiling", detail: "Returns filed for a family of four." },
    { title: "Monthly bookkeeping", detail: "Small business books reconciled." },
  ],
  locksmith: [
    { title: "Lock-out", detail: "Front door opened without damage." },
    { title: "Gate motor service", detail: "Battery and remote replaced." },
    { title: "Lock change", detail: "New cylinder locks for a rental." },
  ],
};

/** Vendors with no completed jobs have no proof of work yet. */
export const proofOfWork = (v: User): WorkItem[] => (v.completed > 0 ? BY_SERVICE[v.service ?? ""] ?? [] : []);
