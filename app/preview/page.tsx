import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewStage, PreviewStageFallback } from "@/components/preview/PreviewStage";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

export const metadata: Metadata = {
  title: "NEXO® | Phone preview",
  description: "See the NEXO® mobile experience side by side: Service Requestor and Vendor, synced live.",
  robots: { index: false },
};

export default function PreviewPage() {
  return (
    <>
      <SiteNav active="/preview/" />
      <main>
        <section className="flex flex-col items-center gap-4 bg-white px-5 pb-6 pt-10 text-center lg:px-16 lg:pb-8 lg:pt-20">
          <h1 className="font-display text-[40px] font-bold leading-tight text-navy lg:text-[56px]">See NEXO® in action.</h1>
          <p className="max-w-[1312px] text-base text-body lg:text-lg">
            Whether you&apos;re looking for a service or offering your skills, take a look around and see how NEXO® works for you.
          </p>
          <p className="max-w-2xl text-sm text-body/80">
            The Service Requestor (Alex) and the Vendor (John) share the same live data. Accept a bid on one phone and watch it land on the other.
          </p>
        </section>
        <Suspense fallback={<PreviewStageFallback />}>
          <PreviewStage />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
