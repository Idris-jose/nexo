"use client";

import { useState } from "react";
import { FadeIn } from "@/app/components/ui/FadeIn";

const faqsLeft = [
  {
    question: "How does NEXO® work?",
    answer:
      "NEXO® connects clients with verified service professionals. You can either post a job and receive quotes, or browse our directory of providers and book directly. All payments are handled securely through the platform.",
  },
  {
    question: "What is the difference between Post a Gig and Find a Provider?",
    answer:
      "\"Post a Gig\" lets you describe a job and receive proposals from interested professionals. \"Find a Provider\" lets you browse available pros, view their profiles and portfolios, and reach out directly.",
  },
  {
    question: "How does payment work?",
    answer:
      "Clients pay upfront when booking. Funds are held securely in escrow and only released to the provider once the job is marked complete and approved. This protects both parties.",
  },
  {
    question: "Can I cancel anything?",
    answer:
      "Yes. Clients can cancel a booking before work begins for a full refund. After work has started, cancellations are subject to our cancellation policy, which varies by provider.",
  },
];

const faqsRight = [
  {
    question: "How do I join NEXO®?",
    answer:
      "Sign up for free at nexo.com. If you're a client, you can start posting jobs immediately. Providers go through a verification process including ID and background checks before being listed.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Providers receive payment directly to their linked bank account or digital wallet once a job is completed and approved. Payouts are typically processed within 1–3 business days.",
  },
  {
    question: "How do I control my fees?",
    answer:
      "Providers can set their own rates and fees. NEXO® charges a 12% commission on each completed job, which covers payment processing, insurance, and platform support.",
  },
  {
    question: "How much is the platform fee?",
    answer:
      "Providers pay a 12% commission on each completed job, and customers pay a flat R30 booking fee per booking. There are no monthly subscription fees, no listing fees, and no hidden charges.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="text-[#1a1a2e] font-semibold text-base">{question}</span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-gray-500 text-sm leading-relaxed pb-5">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up" className="text-left mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-4">
            Frequently asked questions
          </h2>
        </FadeIn>

        {/* Two column FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          <FadeIn direction="left" delay={0}>
            <div>
              {faqsLeft.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </FadeIn>
          <FadeIn direction="right" delay={100}>
            <div>
              {faqsRight.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Bottom CTA Banner */}
        <FadeIn direction="up" delay={200}>
          <div className="mt-20 bg-[#E3F4F2] rounded-3xl px-8 py-14 text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#0B1F5C] mb-4">
              Whatever needs doing, NEXO® gets you closer.
            </h3>
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of satisfied clients and professional providers on the platform built for real work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/browse-providers"
                className="inline-flex items-center justify-center gap-2 bg-[#0B1F5C] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#00A87D] transition-colors"
              >
                Get Started
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#0E8A7F] text-[#0E8A7F] font-semibold px-8 py-4 rounded-xl hover:border-white/60 transition-colors"
              >
                Apply as Professional
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

