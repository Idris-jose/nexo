import Link from "next/link";

export default function ProviderHero() {
  return (
    <section className="bg-[#0A1628] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest text-[#00C896] uppercase mb-5">
              Become a Provider
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Don't just take our word for it.{" "}
              <span className="text-[#00C896]">Try Nexo.</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
              Join thousands of professionals already growing their business on Nexo.
              Find more clients, manage your work, and get paid — all in one place.
            </p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-[#00C896] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#00A87D] transition-colors text-base"
            >
              Apply as Professional
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {/* Stats Row */}
            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <p className="text-3xl font-extrabold text-white">10K+</p>
                <p className="text-gray-400 text-sm">Active Providers</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">820</p>
                <p className="text-gray-400 text-sm">Service Categories</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">4.9★</p>
                <p className="text-gray-400 text-sm">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right: Image Placeholder */}
          <div className="hidden lg:block">
            <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a3a5c] border border-white/10 rounded-2xl h-[440px] flex items-center justify-center relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-2 border-[#00C896]" />
                <div className="absolute bottom-12 left-8 w-20 h-20 rounded-full border border-[#00C896]" />
                <div className="absolute top-24 left-16 w-3 h-3 bg-[#00C896] rounded-full" />
                <div className="absolute bottom-24 right-16 w-5 h-5 bg-[#00C896] rounded-full" />
              </div>

              {/* Provider illustration */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-[#00C896]/20 rounded-full flex items-center justify-center border-2 border-[#00C896]/50">
                  <svg className="w-14 h-14 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center border border-white/20">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#00C896]" />
                    <span className="text-[#00C896] text-xs font-semibold">Verified Professional</span>
                  </div>
                  <p className="text-white font-bold">Service Provider</p>
                  <p className="text-gray-400 text-sm">Ready to work</p>
                </div>

                <div className="flex gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center">
                    <p className="text-white font-bold text-lg">$2,840</p>
                    <p className="text-gray-400 text-xs">This month</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center">
                    <p className="text-white font-bold text-lg">24</p>
                    <p className="text-gray-400 text-xs">Jobs done</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

