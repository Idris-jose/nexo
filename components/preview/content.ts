import { BriefcaseBusiness, ChartColumn, ClipboardList, MapPin, Search, ShieldCheck, Tag, Wrench, type LucideIcon } from "lucide-react";

export type View = "customer" | "vendor" | "both";

/** iPhone 15 viewport, the only preview device. */
export const DEVICE = { w: 393, h: 852 } as const;

export const PHONES = {
  customer: { caption: "Service Requestor · Alex T.", src: "/app/?as=u_alex#/", open: "/app/#/" },
  vendor: { caption: "Vendor · John M. (Electrician)", src: "/vendor/?as=u_john#/", open: "/vendor/#/" },
} as const;

export const HIGHLIGHTS: Record<"customer" | "vendor", { icon: LucideIcon; title: string; body: string }[]> = {
  customer: [
    { icon: Search, title: "Find the right professional", body: "Discover providers based on the services you need." },
    { icon: BriefcaseBusiness, title: "Choose how you hire", body: "Post a job for bids or request a provider directly." },
    { icon: ClipboardList, title: "Manage your services", body: "Keep track of your requests, bookings and ongoing jobs." },
    { icon: ShieldCheck, title: "Stay in control", body: "Follow the service process and manage your interactions." },
  ],
  vendor: [
    { icon: MapPin, title: "Discover opportunities", body: "Find gigs that match your skills and services." },
    { icon: Tag, title: "Submit bids", body: "Respond to opportunities and compete for jobs." },
    { icon: Wrench, title: "Manage your work", body: "Keep up with active and completed jobs." },
    { icon: ChartColumn, title: "Track earnings", body: "Monitor your income and service activity." },
  ],
};

export const CTA = {
  customer: { title: "Ready to find the help you need?", body: "Get connected with the right professionals and make getting things done easier.", label: "Get Started", href: "/login/", tone: "navy" },
  vendor: { title: "Ready to put your skills to work?", body: "Join NEXO®, connect with customers and start finding opportunities.", label: "Become a Provider", href: "/become-a-provider/", tone: "teal" },
} as const;
