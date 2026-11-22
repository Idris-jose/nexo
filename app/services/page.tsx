import type { Metadata } from "next";
import { Placeholder } from "@/components/site/Placeholder";

export const metadata: Metadata = { title: "NEXO® | Services" };

export default function Page() {
  return <Placeholder title="Services" body="Electrical, plumbing, cleaning, painting and more. This page is coming soon." active="/services/" />;
}
