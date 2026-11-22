import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/app/components/ui/FadeIn";

export default function HeroSection() {
  return (
    <section className="bg-white">
     

      {/* Content */}
      <FadeIn direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block uppercase text-[10px] sm:text-xs font-bold tracking-widest text-[#00C896] uppercase mb-4">
             NEXO®  marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0B1F5C] leading-tight mb-5">
              Where needs meet the <span className="text-[#0E8A7F]">right people.</span>
            </h1>
            <p className="text-base text-gray-500 mb-7 leading-relaxed max-w-lg">
              From everyday tasks to expert services, connect with trusted professionals around you and get the job done without the hassle.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/browse-providers"
                className="bg-[#0B1F5C] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#0D1B2A] transition-colors text-center text-sm"
              >
                Become a client
              </Link>
              <Link
                href="/become-provider/"
                className="border-2 border-[#0E8A7F] text-[#0E8A7F] font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
              >
                Explore Provider Preview
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-5 sm:gap-8">
              <div className="flex-col items-center gap-2">
                 <h1 className="text-[28px] font-semibold text-[#0E8A7F]">100%</h1>
                 <p className="text-[12px] font-medium text-[#4B5563]">Verified Indivisuals</p>
              </div>
              <div className="flex-col items-center gap-2">
                <h1 className="text-[28px] font-semibold text-[#0E8A7F]">R20 </h1>
                <p className="text-[12px] font-medium text-[#4B5563]">Flat service fee</p>
              </div>
              <div className="flex-col items-center gap-2">
                <h1 className="text-[28px] font-semibold text-[#0E8A7F]">3% </h1>
                <p className="text-[12px] font-medium text-[#4B5563]">vendor comission</p>
              </div>
            </div>
          </div>

          {/* Right: Hero Image — desktop only */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-[480px] flex items-end">
                <div>
                <Image alt="hero" src="/Nexoimages/image 7.png" width={1000} height={1000} />
               </div>
              </div>
              {/* Floating badge */}
              <div className="absolute flex text-left top-6 right-6 bg-white rounded-xl shadow-lg px-4 py-3 gap-2">
                <Image  alt="badge" src="/Nexoimages/Avatar (placeholder).png" width={50} height={50} />
                <div>
                 <p className="text-xs font-semibold text-[#1a1a2e]">Daniel O.</p>
                <p className="text-[10px] text-gray-500">Electrical Services</p>
                <p className="text-[10px] text-gray-500">4.9 ★ · 28 reviews</p>
                </div>
              </div>
              {/* Rating badge */}
              <div className="absolute flex items-center gap-2 bottom-10 left-6 bg-white rounded-xl shadow-lg px-4 py-3">

                <Image  alt="badge" src="/Nexoimages/Success icon holder.png" width={50} height={50} />
                <div>
                <p className="text-xs font-semibold text-[#1a1a2e]">Request sent</p>
                <p className="text-[10px] text-gray-500">Your service request is on its way.</p>
                </div>
                
              </div>
            </div>
          </div>

           {/* Mobile: image on top, full width */}
      <div className="lg:hidden w-full h-56 sm:h-72 bg-gradient-to-br from-slate-600 to-slate-700 relative overflow-hidden flex items-center justify-center">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-[480px] flex items-end">
                <div>
                <Image alt="hero" src="/Nexoimages/Heroimage1.png" width={1000} height={1000} />
               </div>
          </div>
        
      </div>
        </div>
      </FadeIn>
    </section>
  );
}
