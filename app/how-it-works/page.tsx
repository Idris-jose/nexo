import type { Metadata } from "next";
import { Placeholder } from "@/components/site/Placeholder";

export const metadata: Metadata = { title: "NEXO® | How NEXO® works" };

export default function Page() {
  return <Placeholder title="How NEXO® works" body="Post a job for bids or request a provider directly. This page is coming soon." active="/how-it-works/" />;
}
