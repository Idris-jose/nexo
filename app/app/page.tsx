import type { Metadata } from "next";
import { Suspense } from "react";
import RequestorApp from "@/components/requestor/RequestorApp";
import { Loading } from "@/components/ui";

export const metadata: Metadata = { title: "NEXO® | Service Requestor", robots: { index: false } };

export default function AppPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-cream"><Loading label="Opening NEXO®…" /></div>}>
      <RequestorApp />
    </Suspense>
  );
}
