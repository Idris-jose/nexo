import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import ServiceCategories from "./components/ServiceCategories";
import HowItWorks from "./components/HowItWorks";
import TwoWays from "./components/TwoWays";
import TrustFeatures from "./components/TrustFeatures";
import TryNexo from "./components/TryNexo";
import ProviderCTA from "./components/ProviderCTA";
import FAQ from "./components/FAQ";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ServiceCategories />
        <HowItWorks />
        <TwoWays />
         <TryNexo />
        <TrustFeatures />
        <ProviderCTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
