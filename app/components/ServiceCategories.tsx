import Link from "next/link";
import { FadeIn } from "@/app/components/ui/FadeIn";

const categories = [
  {
    label: "Plumbing",
    description: "Repairs, installations, pipe work and more",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M11 4a1 1 0 011-1h1a5 5 0 015 5v1a1 1 0 01-1 1h-1v2h1a1 1 0 011 1v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5a1 1 0 011-1h1v-2H7a1 1 0 01-1-1V8a5 5 0 015-5h1a1 1 0 011 1v1z" />
      </svg>
    ),
  },
  {
    label: "Electrical",
    description: "Wiring, circuits, lighting and electrical work",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "Cleaning",
    description: "Home, office and commercial cleaning services",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    label: "Painting",
    description: "Interior and exterior painting for all spaces",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    label: "Repairs & Handyman",
    description: "General repairs, maintenance and handyman tasks",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Gardening",
    description: "Landscaping, lawn care and garden upkeep",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Moving & Delivery",
    description: "Local and long-distance moving assistance",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0H3m2 0h4" />
      </svg>
    ),
  },
  {
    label: "And many more",
    description: "120+ more services to explore on the app.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
    ),
  }
];

export default function ServiceCategories() {
  return (
    <section className="bg-[#F3F5F8] py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — left-aligned on mobile, centered on desktop */}
        <FadeIn direction="up" className="mb-10 md:mb-14 md:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-3">
            What do you need help with?
          </h2>
          <p className="text-gray-500 text-left">
            Find the right professional in NEXO®, all over our platform.
          </p>
        </FadeIn>

        {/* Unified grid: 1 col on mobile → 2 col sm → 3 col md → 4 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <FadeIn key={cat.label} direction="up" delay={i * 60}>
              <div
                className="group flex flex-col text-left items-left gap-3 p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#00C896] hover:shadow-md transition-all  h-full"
              >
                <div className="w-14 h-14 rounded-full bg-[#E3F4F2] group-hover:bg-[#00C896]/10 flex items-center justify-center text-[#0E8A7F] group-hover:text-[#00C896] transition-colors">
                  {cat.icon}
                </div>
                <span className="text-sm font-semibold text-[#1a1a2e] text-left leading-tight">
                  {cat.label}
                </span>
                <p className="text-xs text-gray-400 text-left mt-0.5 truncate">{cat.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
