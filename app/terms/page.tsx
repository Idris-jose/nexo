import type { Metadata } from "next";
import { Placeholder } from "@/components/site/Placeholder";

export const metadata: Metadata = { title: "NEXO® | Terms & Conditions" };

export default function Page() {
  return <Placeholder title="Terms & Conditions" body="This page is coming soon." active="/terms/" />;
}
