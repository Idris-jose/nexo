import type { Metadata } from "next";
import { Placeholder } from "@/components/site/Placeholder";

export const metadata: Metadata = { title: "NEXO® | Privacy Policy" };

export default function Page() {
  return <Placeholder title="Privacy Policy" body="This page is coming soon." active="/privacy/" />;
}
