import Link from "next/link";
import { FadeIn } from "@/app/components/ui/FadeIn";
import LivePhonePreview from "@/app/components/LivePhonePreview";

export default function TryNexo() {
  return (
    <section className="bg-[#0B1F5C] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left: Text content */}
          <FadeIn direction="left" className="flex-1 w-full">
            <span className="inline-block text-xs font-bold tracking-widest text-[#00C896] uppercase mb-5">
              No sign-up required
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
              Don&apos;t just take our word for it. Try NEXO®.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">
              Explore the NEXO® experience for yourself. Browse, discover how services work and get
              familiar with the platform — no sign-up required.
            </p>
            <Link
              href="/preview/"
              className="inline-flex items-center justify-center bg-[#00C896] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#00A87D] transition-colors text-sm"
            >
              Explore Phone Preview
            </Link>
            <p className="text-gray-500 text-xs mt-4">No account needed. Just explore.</p>
          </FadeIn>

          {/* Right: the live demo app in a phone frame */}
          <FadeIn direction="right" delay={150} className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
            <LivePhonePreview />
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
