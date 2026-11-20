import Image from "next/image";
import { FadeIn } from "@/app/components/ui/FadeIn";

const steps = [
  {
    number: "01",
    title: "Find what you need",
    description:
      "Browse hundreds of service categories or search for exactly what you're looking for. Post a job or browse available providers.",
    Image:"/Nexoimages/Image_ Find what you need.png"
    
  },
  {
    number: "02",
    title: "Choose your professional",
    description:
      "Review profiles, ratings, portfolios, and prices. Compare options and pick the pro that fits your needs and budget.",
  Image:"/Nexoimages/Image_ Choose your professional.png"
  },
  {
    number: "03",
    title: "Get the job done",
    description:
      "Your chosen professional arrives and completes the work. All bookings are protected and payments handled securely.",
    Image:"/Nexoimages/Image_ Get the job done.png"
  },
  {
    number: "04",
    title: "Complete and review",
    description:
      "Confirm work completion, release payment, and leave a review. Your feedback helps the community find the best professionals.",
   Image:"/Nexoimages/Image_ Complete and review.png"
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F9FAFB] py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up" className="mb-10 md:mb-16 md:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-3">
            Getting the help you need is simple.
          </h2>
          <p className="text-gray-500 md:text-left text-base md:text-lg ">
            Four easy steps to connect with the right professional.
          </p>
        </FadeIn>

        {/* Unified grid: 1 col mobile → 2 col sm → 4 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <FadeIn key={step.number} direction="up" delay={i * 100}>
              <div className="rounded-2xl p-7 h-full border border-white shadow-sm bg-white">
                <Image src={step.Image} width={300} height={300} alt="step" className="w-full h-auto rounded-xl mb-5" />
                <span className="text-xs mt-4 font-bold text-[#00C896] tracking-widest uppercase mb-4 block">
                  {step.number}
                </span>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
