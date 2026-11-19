import Link from "next/link";

export default function ProviderPageHero() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block text-xs font-bold tracking-widest text-[#00C896] uppercase mb-6">
              For Service Professionals
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0A1628] leading-[1.1] mb-6">
              Turn your skills
              <br />
              into{" "}
              <span className="text-[#00C896]">opportunities.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Connect with customers looking for your services, discover new jobs
              and grow your business with Nexo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#"
                className="inline-flex items-center justify-center bg-[#0A1628] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#0D1B2A] transition-colors text-sm"
              >
                Become a Provider
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center border border-[#0A1628] text-[#0A1628] font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Explore Provider Preview
              </Link>
            </div>
          </div>

          {/* Right: Workers photo placeholder */}
          <div className="hidden lg:block">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 h-[400px] flex items-center justify-center relative">
              {/* Aerial view of workers illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800" />
                  {/* Worker dots – aerial view simulation */}
                  <div className="absolute inset-0 flex items-center justify-center gap-6">
                    {[
                      { x: "30%", y: "35%", rotate: "rotate-12" },
                      { x: "50%", y: "50%", rotate: "-rotate-6" },
                      { x: "65%", y: "30%", rotate: "rotate-45" },
                      { x: "40%", y: "65%", rotate: "-rotate-12" },
                    ].map((pos, i) => (
                      <div
                        key={i}
                        className={`absolute w-16 h-20 ${pos.rotate}`}
                        style={{ left: pos.x, top: pos.y, transform: `translate(-50%,-50%)` }}
                      >
                        <div className="bg-orange-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                    {/* Rope/cable lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                      <path d="M120 105 L200 150 L260 90 L160 195" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <path d="M200 150 L160 195" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  {/* Overlay label */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow">
                    <p className="text-xs font-bold text-[#0A1628]">Verified Professionals</p>
                    <p className="text-[10px] text-gray-500">Working on Nexo</p>
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

