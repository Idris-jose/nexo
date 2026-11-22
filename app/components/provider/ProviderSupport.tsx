import { FadeIn } from "../ui/FadeIn";

const supportFeatures = [
  {
   
    title: "Verified accounts",
    description: "Verification helps establish trust across the marketplace.",
  },
  {
   
    title: "Structured job management",
    description: "Manage service engagements through the platform.",
  },
  {
  
    title: "Clear communication",
    description: "Keep relevant service details and customer communication organised.",
  },
  {
   
    title: "Support",
    description: "Access help when you need assistance with your NEXO® experience.",
  },
];

export default function ProviderSupport() {
  return (
    <section className="bg-[#F3F5F8] py-20 border-t border-gray-100">
      <FadeIn direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F5C] mb-3">
            You&apos;re doing the work. You&apos;re not doing it alone.
          </h2>
          <p className="text-gray-500 text-base max-w-2xl">
           NEXO® helps bring customers and service professionals together, with tools to manage your jobs and support when you need help navigating the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportFeatures.map((feature,i) => (
            <FadeIn
            direction="up"
            delay={i * 60}
              key={feature.title}
              className="p-6 rounded-xl bg-white border border-gray-100 hover:border-[#00C896]/40 hover:shadow-sm transition-all"
            >
              <div className="bg-[#0E8A7F] rounded h-1 w-20 mb-4 "></div>
              <h3 className="text-base font-bold text-[#0B1F5C] mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </FadeIn>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

