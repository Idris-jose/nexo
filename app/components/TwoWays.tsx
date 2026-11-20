import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/app/components/ui/FadeIn";

export default function TwoWays() {
  return (
    <section className="bg-[#F3F5F8] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up" className="text-left mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F5C] mb-4">
            One platform. Two ways to get things done.
          </h2>
          <p className="text-gray-500 text-lg ">
            Whether you have a specific job in mind or want to browse available pros, Nexo has you covered.
          </p>
        </FadeIn>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 - Post a Gig */}
          <FadeIn direction="left" delay={0}>
            <div className="relative rounded-3xl overflow-hidden group bg-[#F9FAFB] border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="p-5">
                <Image src="/Nexoimages/Image_ Post a Gig.png" alt="post" width={700} height={700}/>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">Post a Gig</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Describe what you need and let professionals come to you. Receive quotes and choose the best offer for your project.
                </p>
                <Link
                  href="/browse-providers"
                  className="inline-flex items-center gap-2 bg-[#0B1F5C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#00A87D] transition-colors"
                >
                  Post a Gig
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Card 2 - Find a Provider */}
          <FadeIn direction="right" delay={100}>
            <div className="relative rounded-3xl overflow-hidden group bg-[#F9FAFB] border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="p-5">
                <Image src="/Nexoimages/Image_ Find a Provider.png" alt="post" width={700} height={700}/>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">Find a Provider</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Browse our directory of verified professionals. Filter by category, location, rating, and price to find your perfect match.
                </p>
                <Link
                  href=""
                  className="inline-flex items-center gap-2 border-2 border-[#0E8A7F] text-[#0E8A7F] font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Find a provider
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

