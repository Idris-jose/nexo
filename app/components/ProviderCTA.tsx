import Link from "next/link";

const perks = [
  "Accept or decline listings on your schedule",
  "Build a professional portfolio to attract clients",
  "Track your earnings through the platform",
  "Manage your team and advanced earnings tips",
];

export default function ProviderCTA() {
  return (
    <section className="py-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
        {/* Left: Image placeholder */}
        <div className="bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center min-h-[320px] lg:min-h-auto relative overflow-hidden">
          {/* Hard hat worker illustration */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-28 h-28 bg-yellow-400/20 rounded-full flex items-center justify-center border-4 border-yellow-400/40">
              <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {/* Hard hat */}
            <div className="bg-yellow-400 rounded-t-full w-20 h-10 flex items-end justify-center pb-1 -mt-6 relative">
              <div className="absolute -bottom-2 w-24 h-3 bg-yellow-500 rounded" />
            </div>
            <p className="text-white/60 text-sm mt-4">Service Professional</p>
          </div>

          {/* Background shapes */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Right: Content on dark navy */}
        <div className="bg-[#0A1628] flex items-center px-10 py-16 lg:px-16">
          <div className="max-w-lg">
            <span className="text-xs font-semibold tracking-widest text-[#00C896] uppercase mb-4 block">
              For Service Professionals
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6">
              Your skills deserve more opportunities.
            </h2>

            <ul className="space-y-4 mb-8">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C896]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-base">{perk}</span>
                </li>
              ))}
            </ul>

            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-[#00C896] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#00A87D] transition-colors"
            >
              Become a Provider
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

