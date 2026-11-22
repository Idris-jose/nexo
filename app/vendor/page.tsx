import type { Metadata } from "next";
import { Suspense } from "react";
import VendorApp from "@/components/vendor/VendorApp";
import { Loading } from "@/components/ui";

export const metadata: Metadata = { title: "NEXO® | Vendor", robots: { index: false } };

export default function VendorPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-cream"><Loading label="Opening NEXO®…" /></div>}>
      <VendorApp />
    </Suspense>
  );
}
