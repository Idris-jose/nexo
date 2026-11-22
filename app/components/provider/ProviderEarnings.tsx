import { FadeIn } from "../ui/FadeIn";

const earningsBullets = [
  "Provider commission or service fee (to confirm)",
  "How the fee is calculated (to confirm)",
  "Commission differences by service or job type (to confirm)",
  "When commission is deducted (to confirm)",
  "How provider earnings are calculated (to confirm)",
  "Withdrawal method and payout timing (to confirm)",
  "Minimum withdrawal and payout charges (to confirm)",
];

export default function ProviderEarnings() {
  return (
    <section className="bg-white py-20 border-t border-gray-100">
      <FadeIn direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Know what you earn */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F5C] mb-4">
              Know what you earn.
            </h2>
            <p className="text-gray-500 text-base mb-6 leading-relaxed">
              Understand how platform fees work, what you earn from completed
              jobs and how payments are handled before accepting work.
            </p>
            <ul className="space-y-3">
              {earningsBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-[#0B1F5C] text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0B1F5C] flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Earnings breakdown card */}
          <div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Card header */}
              <div className="bg-[#F9FAFB] border-b border-gray-200 px-6 py-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Illustrative earnings breakdown
                </p>
              </div>

              {/* Card body */}
              <div className="px-6 py-6 space-y-4">
                {/* Job amount */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-[#0A1628]">Job amount</span>
                  <span className="text-sm font-bold text-[#0A1628]">R1,000</span>
                </div>

                {/* Platform commission */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Platform commission</span>
                  <span className="text-sm font-semibold text-red-500">– R____</span>
                </div>

                {/* Your earnings */}
                <div className="flex items-center justify-between py-4 bg-[#00C896]/5 rounded-lg px-3 mt-2">
                  <span className="text-base font-bold text-[#0A1628]">Your earnings</span>
                  <span className="text-base font-extrabold text-[#00C896]">R____</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed pt-2">
                  Example only. Figures and fee calculations to be replaced with NEXO®'s current provider
                  pricing. Do not share guaranteed earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn >
    </section>
  );
}

