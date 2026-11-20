import { FadeIn } from "@/app/components/ui/FadeIn";

const features = [
  {
    icon: (
      <svg className="w-7 h-7 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Verified professionals",
    description:
      "Every provider on Nexo is background-checked and ID-verified before they can offer services — so you always know who's coming.",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "Outsourced payments",
    description:
      "Payments are held in escrow and only released when you approve the work. No cash, no awkward conversations — fully handled.",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
      </svg>
    ),
    title: "ID verification",
    description:
      "Our multi-step ID verification process ensures that every professional is exactly who they claim to be — no exceptions.",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Dispute support",
    description:
      "If anything goes wrong, our dedicated support team is on hand to mediate and resolve issues fairly and quickly.",
  },
];

export default function TrustFeatures() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up" className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-4 max-w-xl">
            Your service. Your peace of mind.
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl">
            Every booking on Nexo is built around trust — with the tools and protections that make hiring a professional completely stress-free.
          </p>
        </FadeIn>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} direction="up" delay={i * 100} className="flex flex-col gap-4">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#00C896]/10 flex items-center justify-center flex-shrink-0">
                {feature.icon}
              </div>
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

