"use client";

import { useState } from "react";

type FAQItem = {
  q: string;
  a: string;
};

const faqGroups: { section: string; items: FAQItem[] }[] = [
  {
    section: "Getting started",
    items: [
      {
        q: "Who can become a provider on NEXO®?",
        a: "Anyone who offers a service can apply to become a provider on NEXO®. This includes tradespeople, freelancers, and service professionals of all kinds. You will need to complete our verification process.",
      },
      {
        q: "How do I register?",
        a: "Click 'Become a Provider' and fill in your details. You'll create a profile, list your services, and submit your verification documents to get started.",
      },
      {
        q: "What documents are required for verification?",
        a: "You'll typically need a valid government-issued ID, proof of address, and any relevant professional certifications or qualifications for your service category.",
      },
      {
        q: "Can I offer more than one service?",
        a: "Yes. You can list multiple services under your provider profile. Each service can have its own description, pricing, and availability settings.",
      },
    ],
  },
  {
    section: "Finding work",
    items: [
      {
        q: "How do I find gigs?",
        a: "Once your profile is live, you can browse available job requests in your service categories. You can also receive notifications for new opportunities that match your skills and location.",
      },
      {
        q: "How does bidding work?",
        a: "Clients post jobs and providers can submit proposals or bids. The client reviews all proposals and selects the provider they'd like to work with.",
      },
      {
        q: "Can customers request my services directly?",
        a: "Yes. If a customer finds your profile and likes what they see, they can reach out to you directly to book your services without going through a bidding process.",
      },
      {
        q: "Am I required to accept every job?",
        a: "No. You have full control over which jobs you accept or decline. You can set your availability and choose the work that fits your schedule and expertise.",
      },
    ],
  },
  {
    section: "Fees & payments",
    items: [
      {
        q: "Does NEXO® charge providers a commission?",
        a: "Yes. NEXO® charges a small platform fee on each completed job. This fee covers payment processing, platform maintenance, and support services.",
      },
      {
        q: "How is my commission calculated?",
        a: "Commission is calculated as a percentage of the job amount. The exact rate will be shown clearly before you accept any job, so there are no surprises.",
      },
      {
        q: "When do I receive my earnings?",
        a: "Earnings are released once the job is marked complete and approved by the client. Payouts are typically processed within 1–3 business days.",
      },
      {
        q: "How do I withdraw my earnings?",
        a: "You can withdraw earnings to your linked bank account or digital wallet. Minimum withdrawal thresholds and processing times vary by region.",
      },
    ],
  },
  {
    section: "Managing jobs",
    items: [
      {
        q: "How do I manage an active job?",
        a: "Use your NEXO® provider dashboard to track active jobs, communicate with clients, update job status, and manage your schedule all in one place.",
      },
      {
        q: "What happens if a customer cancels?",
        a: "If a customer cancels a confirmed job, you may be eligible for a cancellation fee depending on when the cancellation occurs relative to the scheduled work.",
      },
      {
        q: "What happens if a customer disputes a completed job?",
        a: "NEXO®'s support team will review the dispute and work with both parties to reach a fair resolution. We protect providers from unfair or fraudulent claims.",
      },
      {
        q: "How can customers rate or review my work?",
        a: "After a job is completed, clients are invited to leave a star rating and written review on your profile. These reviews help build your reputation on the platform.",
      },
    ],
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-semibold text-[#0A1628] leading-snug">{item.q}</span>
        <span
          className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-4 pr-8">{item.a}</p>
      )}
    </div>
  );
}

export default function ProviderFAQ() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1628] mb-12">
          Frequently asked questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {faqGroups.map((group) => (
            <div key={group.section}>
              <h3 className="text-xs font-bold text-[#0E8A7F] uppercase tracking-widest mb-4">
                {group.section}
              </h3>
              <div>
                {group.items.map((item) => (
                  <FAQAccordion key={item.q} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

