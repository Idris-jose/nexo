import { FadeIn } from "@/app/components/ui/FadeIn";

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-[#0A1628]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Reach more customers",
    description: "Get discovered by people actively looking for the services you offer.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#0A1628]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Discover new jobs",
    description: "Explore service requests and opportunities that match your skills.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#0A1628]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "Manage your workload",
    description: "Keep track of the jobs you accept, your ongoing work and completed services.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#0A1628]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Build your reputation",
    description: "Showcase your work and build credibility through customer feedback and completed jobs.",
  },
];

export default function ProviderFeatures() {
  return (
    <section className="bg-[#F3F5F8] py-20">
      <FadeIn direction="up"  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F5C] mb-3">
            More opportunities. More control over your work.
          </h2>
          <p className="text-gray-500 text-base max-w-2xl">
            Nexo gives you a platform to showcase what you do, connect with customers and manage the jobs you take on.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature,i) => (
            <FadeIn
              direction="up" delay={i * 60}
              key={feature.title}
              className="p-6 rounded-xl border border-gray-100 bg-[#F9FAFB] hover:border-[#00C896]/40 hover:shadow-sm transition-all"
            >
              <div className="mb-4 text-[#0E8A7F] bg-[#F4FBFC]">{feature.icon}</div>
              <h3 className="text-base font-bold text-[#0B1F5C] mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </FadeIn>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

