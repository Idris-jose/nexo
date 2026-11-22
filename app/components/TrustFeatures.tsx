import { FadeIn } from "@/app/components/ui/FadeIn";

const features = [
  {
   
    title: "Verified professionals",
    description:
      "Providers undergo verification before accessing the marketplace.",
  },
  {
   
    title: "Protected payments",
    description:
      "Payments are managed through the platform's service completion process.",
  },
  {
    
    title: "OTP verification",
    description:
      "Verification codes help confirm service start and completion.",
  },
  {
   
    title: "Dispute support",
    description:
      "Customers have a channel to raise issues when a service goes wrong.",
  },
];

export default function TrustFeatures() {
  return (
    <section className="bg-[#F3F5F8] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up" className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-4 max-w-xl">
            Your service. Your peace of mind.
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl">
            Every booking on NEXO® is built around trust — with the tools and protections that make hiring a professional completely stress-free.
          </p>
        </FadeIn>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} direction="up" delay={i * 100} className="flex flex-col bg-white p-5 rounded-lg gap-4">
              {/* Icon */}
              <div className="bg-[#0E8A7F] rounded h-1 w-20"></div>
              {/* Text */}
              <div>
                <h3 className="text-base font-bold text-[#1a1a2e] mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

