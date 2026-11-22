import type { Metadata } from "next";
import { Placeholder } from "@/components/site/Placeholder";

export const metadata: Metadata = { title: "NEXO® | Safety & Trust" };

export default function Page() {
  return <Placeholder title="Safety & Trust" body="Verified individuals, payment protection, and a one-time code at the start and end of every gig. This page is coming soon." active="/safety/" />;
}
