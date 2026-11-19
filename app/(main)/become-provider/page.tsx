import type { Metadata } from "next";
import ProviderPageHero from "../../components/provider/ProviderPageHero";
import ProviderFeatures from "../../components/provider/ProviderFeatures";
import ProviderSteps from "../../components/provider/ProviderSteps";
import ProviderEarnings from "../../components/provider/ProviderEarnings";
import ProviderSupport from "../../components/provider/ProviderSupport";
import ProviderFAQ from "../../components/provider/ProviderFAQ";
import ProviderBottomCTA from "../../components/provider/ProviderBottomCTA";

export const metadata: Metadata = {
  title: "Become a Provider – Nexo",
  description:
    "Turn your skills into opportunities. Join Nexo as a service provider, find more clients, manage your work, and get paid securely.",
};

export default function BecomeProviderPage() {
  return (
    <>
      {/* Section 1: Hero — "Turn your skills into opportunities." */}
      <ProviderPageHero />

      {/* Section 2: Benefits — "More opportunities. More control over your work." */}
      <ProviderFeatures />

      {/* Section 3: How it works — "Start with your skills. We'll take it from there." */}
      <ProviderSteps />

      {/* Section 4: Earnings — "Know what you earn." */}
      <ProviderEarnings />

      {/* Section 5: Platform trust — "You're doing the work. You're not doing it alone." */}
      <ProviderSupport />

      {/* Section 6: FAQ */}
      <ProviderFAQ />

      {/* Section 7: Bottom CTA banner */}
      <ProviderBottomCTA />
    </>
  );
}
