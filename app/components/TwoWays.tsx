import Link from "next/link";

export default function TwoWays() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-4">
            One platform. Two ways to get things done.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Whether you have a specific job in mind or want to browse available pros, Nexo has you covered.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 - Post a Gig */}
          <div className="relative rounded-3xl overflow-hidden group bg-[#F9FAFB] border border-gray-100 hover:shadow-xl transition-shadow">
            {/* Image Placeholder */}
            <div className="bg-gradient-to-br from-[#0A1628] to-[#1a3a5c] h-64 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-32 h-20 bg-white/20 rounded-lg" />
                <div className="absolute top-8 left-8 w-28 h-16 bg-white/10 rounded-lg" />
              </div>
              {/* Laptop with hands illustration */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm font-medium">Post your project online</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">Post a Gig</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Describe what you need and let professionals come to you. Receive quotes and choose the best offer for your project.
              </p>
              <Link
                href="/browse-providers"
                className="inline-flex items-center gap-2 bg-[#00C896] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#00A87D] transition-colors"
              >
                Post a Gig
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 2 - Find a Provider */}
          <div className="relative rounded-3xl overflow-hidden group bg-[#F9FAFB] border border-gray-100 hover:shadow-xl transition-shadow">
            {/* Image Placeholder */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-500 h-64 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Workers illustration */}
              <div className="relative z-10 flex items-end gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/10 rounded-full p-4 backdrop-blur-sm"
                    style={{ marginBottom: i === 1 ? "16px" : "0" }}
                  >
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12z"/>
                    </svg>
                  </div>
                ))}
              </div>
              {/* Safety vest badge */}
              <div className="absolute bottom-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                ✓ Verified Pros
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3">Find a Provider</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Browse our directory of verified professionals. Filter by category, location, rating, and price to find your perfect match.
              </p>
              <Link
                href="/browse-providers"
                className="inline-flex items-center gap-2 border-2 border-[#1a1a2e] text-[#1a1a2e] font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Browse Providers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

