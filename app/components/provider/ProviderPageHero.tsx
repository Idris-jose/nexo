import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/app/components/ui/FadeIn";

export default function ProviderPageHero() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block text-xs font-bold tracking-widest text-[#00C896] uppercase mb-6">
              For Service Professionals
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0A1628] leading-[1.1] mb-6">
              Turn your skills
              <br />
              into{" "}
              <span className="text-[#0E8A7F]">opportunities.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Connect with customers looking for your services, discover new jobs
              and grow your business with Nexo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#"
                className="inline-flex items-center justify-center bg-[#0E8A7F] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#0E8A7F] transition-colors text-sm"
              >
                Become a Provider
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center border border-[#0E8A7F] text-[#0E8A7F] font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Explore Provider Preview
              </Link>
            </div>
          </div>

          {/* Image — below text on mobile, right column on desktop */}
          <div className="w-full lg:block">
            <Image
              src="/Nexoimages/Image_ Hero photo.png"
              alt="workers"
              width={500}
              height={500}
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

