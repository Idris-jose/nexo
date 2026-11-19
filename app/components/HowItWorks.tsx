const steps = [
  {
    number: "01",
    title: "Find what you need",
    description:
      "Browse hundreds of service categories or search for exactly what you're looking for. Post a job or browse available providers.",
    icon: (
      <svg className="w-8 h-8 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: "from-[#00C896]/10 to-[#00C896]/5",
    imageBg: "from-teal-400/30 to-teal-600/50",
  },
  {
    number: "02",
    title: "Choose your professional",
    description:
      "Review profiles, ratings, portfolios, and prices. Compare options and pick the pro that fits your needs and budget.",
    icon: (
      <svg className="w-8 h-8 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "from-blue-100/60 to-blue-50/30",
    imageBg: "from-blue-400/30 to-blue-600/50",
  },
  {
    number: "03",
    title: "Get the job done",
    description:
      "Your chosen professional arrives and completes the work. All bookings are protected and payments handled securely.",
    icon: (
      <svg className="w-8 h-8 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    color: "from-purple-100/60 to-purple-50/30",
    imageBg: "from-purple-400/30 to-purple-600/50",
  },
  {
    number: "04",
    title: "Complete and review",
    description:
      "Confirm work completion, release payment, and leave a review. Your feedback helps the community find the best professionals.",
    icon: (
      <svg className="w-8 h-8 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    color: "from-orange-100/60 to-orange-50/30",
    imageBg: "from-orange-400/30 to-orange-600/50",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F9FAFB] py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-16 md:text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-3">
            Getting the help you need is simple.
          </h2>
          <p className="text-gray-500 text-base md:text-lg md:max-w-xl md:mx-auto">
            Four easy steps to connect with the right professional.
          </p>
        </div>

        {/* Mobile: vertical list with photo placeholders | Desktop: horizontal grid cards */}
        <div className="space-y-6 md:hidden">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              {/* Left: circular photo placeholder */}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.imageBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                {step.icon}
              </div>
              {/* Right: text */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[#00C896] tracking-widest uppercase">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1a1a2e] mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: grid cards */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className={`bg-gradient-to-br ${step.color} rounded-2xl p-7 h-full border border-white shadow-sm`}>
                <span className="text-xs font-bold text-[#00C896] tracking-widest uppercase mb-4 block">
                  Step {step.number}
                </span>
                <div className="mb-5">{step.icon}</div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
