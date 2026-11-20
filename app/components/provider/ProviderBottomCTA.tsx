import Link from "next/link";

export default function ProviderBottomCTA() {
  return (
    <section className="bg-[#0B1F5C] py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
          Your next opportunity could be on Nexo.
        </h2>
        <p className="text-gray-400 text-base mb-8 leading-relaxed">
          Put your skills out there, connect with customers and take the next step in growing your service business.
        </p>
        <Link
          href="#"
          className="inline-flex items-center justify-center bg-[#0E8A7F] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#00A87D] transition-colors text-base"
        >
          Become a Provider
        </Link>
        <p className="text-gray-500 text-sm mt-6">
          Already curious?{" "}
          <Link href="#" className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors">
            Explore the Provider Preview first.
          </Link>
        </p>
      </div>
    </section>
  );
}

