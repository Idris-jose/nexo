import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browse Providers – NEXO®",
  description:
    "Find and hire verified service professionals on NEXO®. Filter by category, location, and rating.",
};

const categories = [
  { label: "Plumbing", count: 142, color: "bg-blue-100 text-blue-700" },
  { label: "Electrical", count: 98, color: "bg-yellow-100 text-yellow-700" },
  { label: "Cleaning", count: 215, color: "bg-green-100 text-green-700" },
  { label: "Painting", count: 87, color: "bg-orange-100 text-orange-700" },
  { label: "Repairs & Handyman", count: 304, color: "bg-purple-100 text-purple-700" },
  { label: "Gardening", count: 76, color: "bg-lime-100 text-lime-700" },
  { label: "Moving & Delivery", count: 63, color: "bg-pink-100 text-pink-700" },
  { label: "HVAC", count: 54, color: "bg-cyan-100 text-cyan-700" },
];

const providers = [
  {
    name: "Alex Thompson",
    role: "Plumber",
    rating: 4.9,
    reviews: 128,
    rate: "$75/hr",
    location: "New York, NY",
    tags: ["Emergency Repairs", "Pipe Installation", "Leak Detection"],
    verified: true,
  },
  {
    name: "Maria Garcia",
    role: "Electrician",
    rating: 4.8,
    reviews: 94,
    rate: "$85/hr",
    location: "Los Angeles, CA",
    tags: ["Wiring", "Panel Upgrades", "EV Chargers"],
    verified: true,
  },
  {
    name: "James Wilson",
    role: "Cleaner",
    rating: 4.9,
    reviews: 203,
    rate: "$45/hr",
    location: "Chicago, IL",
    tags: ["Deep Cleaning", "Move-In/Out", "Commercial"],
    verified: true,
  },
  {
    name: "Sarah Lee",
    role: "Painter",
    rating: 4.7,
    reviews: 67,
    rate: "$60/hr",
    location: "Houston, TX",
    tags: ["Interior", "Exterior", "Faux Finish"],
    verified: true,
  },
  {
    name: "David Brown",
    role: "Handyman",
    rating: 4.8,
    reviews: 182,
    rate: "$55/hr",
    location: "Phoenix, AZ",
    tags: ["Drywall", "Furniture Assembly", "General Repairs"],
    verified: true,
  },
  {
    name: "Emily Davis",
    role: "Gardener",
    rating: 4.9,
    reviews: 56,
    rate: "$40/hr",
    location: "Philadelphia, PA",
    tags: ["Landscaping", "Lawn Care", "Tree Trimming"],
    verified: true,
  },
];

export default function BrowseProvidersPage() {
  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Page Hero */}
      <div className="bg-[#0A1628] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#00C896] uppercase mb-4">
            Find Professionals
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Browse Providers
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
            Discover verified professionals across hundreds of service categories.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="What service do you need?"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-[#1a1a2e] text-base focus:outline-none focus:ring-2 focus:ring-[#00C896]"
              />
            </div>
            <button className="bg-[#00C896] text-white font-semibold px-6 py-4 rounded-xl hover:bg-[#00A87D] transition-colors whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filters */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.label}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${cat.color} hover:opacity-80 transition-opacity`}
              >
                {cat.label}
                <span className="text-xs opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1a1a2e]">
            {providers.length} Providers Available
          </h2>
          <select className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]">
            <option>Sort by: Top Rated</option>
            <option>Sort by: Lowest Price</option>
            <option>Sort by: Most Reviews</option>
          </select>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Provider header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar placeholder */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00C896]/30 to-[#0A1628]/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-[#0A1628]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1a1a2e]">{provider.name}</h3>
                    {provider.verified && (
                      <svg className="w-4 h-4 text-[#00C896]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{provider.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold text-[#1a1a2e]">{provider.rating}</span>
                    <span className="text-sm text-gray-400">({provider.reviews} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00C896] font-bold text-base">{provider.rate}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {provider.location}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {provider.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-[#F9FAFB] text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="#"
                className="block w-full text-center bg-[#0A1628] text-white font-semibold py-3 rounded-xl hover:bg-[#0D1B2A] transition-colors text-sm"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="border-2 border-[#0A1628] text-[#0A1628] font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors">
            Load More Providers
          </button>
        </div>
      </div>
    </div>
  );
}

