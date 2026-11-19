const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up and let us about yourself and the services you offer.",
  },
  {
    number: "02",
    title: "Complete verification",
    description: "Submit the required information to complete your provider verification.",
  },
  {
    number: "03",
    title: "Find and secure work",
    description: "Explore gigs, bid on opportunities or receive clients' service requests.",
  },
  {
    number: "04",
    title: "Complete the job",
    description: "Deliver the service, follow the platform processes and confirm completion.",
  },
  {
    number: "05",
    title: "Receive your earnings",
    description: "Track your earnings and follow the applicable payout process.",
  },
];

export default function ProviderSteps() {
  return (
    <section className="bg-[#F9FAFB] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1628] mb-3">
            Start with your skills. We&apos;ll take it from there.
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-xl border border-gray-200 p-7 hover:border-[#00C896]/50 hover:shadow-sm transition-all"
            >
              <span className="text-xs font-bold text-gray-400 tracking-widest mb-4 block">
                {step.number}
              </span>
              <h3 className="text-base font-bold text-[#0A1628] mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

