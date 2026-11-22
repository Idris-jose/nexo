import Link from "next/link";
import { FadeIn } from "@/app/components/ui/FadeIn";

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
              href="#"
              className="inline-flex items-center justify-center bg-[#00C896] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#00A87D] transition-colors text-sm"
            >
              Explore Phone Preview
            </Link>
            <p className="text-gray-500 text-xs mt-4">No account needed. Just explore.</p>
          </FadeIn>

          {/* Right: Phone mockup */}
          <FadeIn direction="right" delay={150} className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
            <div className="relative w-56 sm:w-64 md:w-72">
              {/* Phone outer shell */}
              <div className="bg-[#132240] border-2 border-[#1e3560] rounded-[2.5rem] p-3 shadow-2xl">
                {/* Screen */}
                <div className="bg-[#1a2e50] rounded-[2rem] overflow-hidden aspect-[9/18]">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <span className="text-white/60 text-[10px] font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1.5 rounded-sm bg-white/40" />
                      <div className="w-3 h-1.5 rounded-sm bg-white/40" />
                      <div className="w-3 h-1.5 rounded-sm bg-white/40" />
                    </div>
                  </div>

                  {/* App content */}
                  <div className="px-4 py-3 space-y-3">
                    {/* Search bar */}
                    <div className="bg-[#243a60] rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-white/30 text-[10px]">Search services…</span>
                    </div>

                    {/* Category chips */}
                    <div className="flex gap-2 overflow-hidden">
                      {["Cleaning", "Plumbing", "Garden"].map((cat) => (
                        <div key={cat} className="bg-[#00C896]/20 rounded-full px-2.5 py-1 flex-shrink-0">
                          <span className="text-[#00C896] text-[9px] font-semibold">{cat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Provider cards */}
                    {[
                      { name: "James A.", rating: "4.9", jobs: "142 jobs" },
                      { name: "Sarah M.", rating: "5.0", jobs: "98 jobs" },
                      { name: "Mike T.",  rating: "4.8", jobs: "211 jobs" },
                    ].map((p) => (
                      <div key={p.name} className="bg-[#243a60] rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00C896]/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#00C896]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-semibold truncate">{p.name}</p>
                          <p className="text-white/40 text-[9px]">{p.jobs}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <svg className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-white/60 text-[9px]">{p.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-[#00C896]/5 rounded-[3rem] blur-2xl -z-10" />
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
