import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/app/components/ui/FadeIn";

const perks = [
  "Accept or decline listings on your schedule",
  "Build a professional portfolio to attract clients",
  "Track your earnings through the platform",
  "Manage your team and advanced earnings tips",
];

export default function ProviderCTA() {
  return (
    <section className="py-20 justify-center w-full max-w-7xl mx-auto ">
        

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] w-full max-w-7xl mx-auto items-center">
        {/* Image — top on mobile, left column on desktop */}
        <FadeIn direction="left">
          <div className="w-full">
            <Image src="/Nexoimages/Image_ service provider preparing for a job.png" alt="dd" width={500} height={500} className="w-full h-auto rounded-2xl" />
          </div>
        </FadeIn>

        {/* Content — below image on mobile, right column on desktop */}
        <FadeIn direction="right" delay={100}>
          <div className="bg-white flex items-center px-4 py-10 sm:px-10 lg:px-16">
            <div className="max-w-lg">
              <span className="text-xs font-semibold tracking-widest text-[#0E8A7F] uppercase mb-4 block">
                For Service Professionals
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F5C] leading-tight mb-2">
                Your skills deserve more opportunities.
              </h2>
              <p className="text-[#4B5563]">Find new customers, take on jobs that fit your skills and grow your service business with Nexo.</p>

              <ul className="space-y-4 mt-3 mb-8">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#00C896]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#0B1F5C] text-base">{perk}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="#"
                className="inline-flex items-center gap-2 bg-[#0E8A7F] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#00A87D] transition-colors"
              >
                Become a Provider
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

