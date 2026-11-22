import type { Metadata } from "next";
import { Placeholder } from "@/components/site/Placeholder";

export const metadata: Metadata = { title: "NEXO® | Admin", robots: { index: false } };

export default function AdminPage() {
  return <Placeholder title="Admin console" body="Platform overview, verifications, gigs and payments. Coming soon." />;
}
