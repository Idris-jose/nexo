import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-white">
      {/* Mobile: image on top, full width */}
      <div className="lg:hidden w-full h-56 sm:h-72 bg-gradient-to-br from-slate-600 to-slate-700 relative overflow-hidden flex items-center justify-center">
        {/* Two-person illustration */}
        <div className="flex items-end justify-center gap-6 h-full pb-4 w-full px-6">
          {/* Person 1 */}
          <div className="flex-1 max-w-[140px] h-44 bg-gradient-to-t from-blue-900/40 to-slate-500 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            <svg className="w-16 h-16 text-white/70 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          {/* Person 2 */}
          <div className="flex-1 max-w-[120px] h-36 bg-gradient-to-t from-slate-800/40 to-slate-500 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            <div className="flex flex-col items-center gap-1 relative z-10">
              <svg className="w-12 h-12 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
              <div className="bg-white/80 rounded px-1.5 py-0.5">
                <svg className="w-4 h-4 text-[#0A1628]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Verified badge */}
        <div className="absolute top-3 right-3 bg-white/95 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow">
          <div className="w-2 h-2 rounded-full bg-[#00C896]" />
          <span className="text-[10px] font-bold text-[#1a1a2e]">Verified Pro</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block text-[10px] sm:text-xs font-bold tracking-widest text-[#00C896] uppercase mb-4">
              Become a Client
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1a1a2e] leading-tight mb-5">
              Where needs meet
              <br className="hidden sm:block" /> the right people.
            </h1>
            <p className="text-base text-gray-500 mb-7 leading-relaxed max-w-lg">
              Connect with top verified professionals for any job — big or small.
              Nexo makes finding the right person simple, fast, and stress-free.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/browse-providers"
                className="bg-[#0A1628] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#0D1B2A] transition-colors text-center text-sm"
              >
                Become a client
              </Link>
              <Link
                href="/become-provider"
                className="border-2 border-[#0A1628] text-[#0A1628] font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
              >
                Explore Provider Preview
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-5 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00C896]/10 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[#1a1a2e]">100% Verified Pros</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00C896]/10 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[#1a1a2e]">820 Categories</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00C896]/10 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[#1a1a2e]">5% Platform Fee</p>
              </div>
            </div>
          </div>

          {/* Right: Hero Image — desktop only */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-[480px] flex items-end">
                <div className="w-full flex justify-around items-end pb-6 px-6 gap-4">
                  <div className="bg-gradient-to-t from-[#00C896]/20 to-gray-300 rounded-xl h-80 flex-1 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/30 to-transparent" />
                    <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                  <div className="bg-gradient-to-t from-[#0A1628]/20 to-gray-300 rounded-xl h-64 flex-1 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/30 to-transparent" />
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                      </svg>
                      <div className="bg-white/80 rounded px-2 py-1">
                        <svg className="w-6 h-6 text-[#0A1628]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute top-6 right-6 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00C896]" />
                <span className="text-xs font-semibold text-[#1a1a2e]">Verified Pro</span>
              </div>
              {/* Rating badge */}
              <div className="absolute bottom-10 left-6 bg-white rounded-xl shadow-lg px-4 py-3">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs font-semibold text-[#1a1a2e]">4.9 / 5.0</p>
                <p className="text-[10px] text-gray-500">2,400+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
