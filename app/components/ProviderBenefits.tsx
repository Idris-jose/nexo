const benefits = [
  {
    title: "Verified Professionals",
    description:
      "Every provider on Nexo goes through a rigorous vetting process. Background checks, skill assessments, and ID verification ensure you only deal with trusted pros.",
    icon: (
      <svg className="w-8 h-8 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Protected Payments",
    description:
      "Client payments are held securely until the job is completed to satisfaction. No more chasing invoices or worrying about getting paid.",
    icon: (
      <svg className="w-8 h-8 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "RFP Verification",
    description:
      "Our request-for-proposal system ensures that every job listing is verified and legitimate. Providers can apply with confidence.",
    icon: (
      <svg className="w-8 h-8 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Dispute Support",
    description:
      "If anything goes wrong, our dedicated support team steps in to mediate and resolve disputes fairly for both parties.",
    icon: (
      <svg className="w-8 h-8 text-[#00C896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function ProviderBenefits() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-4">
            Your service. Your peace of mind.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Nexo is built to protect and empower service professionals at every step.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-[#F9FAFB] rounded-2xl p-7 border border-gray-100 hover:border-[#00C896]/40 hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-[#00C896]/10 flex items-center justify-center mb-5">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">{benefit.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

