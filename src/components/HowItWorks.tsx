'use client';

/*
 * HowItWorks — Southern Ground Capital
 * Design: Industrial Precision — light section with amber step indicators
 * 4-step process with connecting line
 */

import { ClipboardList, FileCheck, Banknote } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Submit Your Deal",
    description:
      "Send us the property details — purchase price, rehab budget, and ARV. Our form takes less than 3 minutes.",
  },
  {
    number: "02",
    icon: FileCheck,
    title: "Get Terms Fast",
    description:
      "Clear numbers within 24–48 hours. No obligation. No hidden fees. Just a straightforward term sheet so you can decide.",
  },
  {
    number: "03",
    icon: Banknote,
    title: "Close & Execute",
    description:
      "We fund so you can focus on the project — not the paperwork. Many deals close in 5–10 business days.",
  },
];

export function HowItWorks() {
  const scrollToContact = () => {
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="how-it-works" className="py-24 bg-[#F0F4F8]">
      <div className="container">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
              Simple Process
            </span>
            <div className="h-px w-12 bg-[#E8A020]" />
          </div>
          <h2 className="font-display text-[#0A1628] text-4xl md:text-5xl leading-tight mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-[#0A1628]/60 max-w-xl mx-auto text-sm leading-relaxed">
            We've streamlined the lending process so you can focus on finding great deals, not chasing paperwork.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[16.5%] right-[16.5%] h-px bg-[#E8A020]/30 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center text-center">
                  {/* Step Circle */}
                  <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full bg-[#0A1628] flex flex-col items-center justify-center border-2 border-[#E8A020]/40 shadow-[0_8px_32px_rgba(10,22,40,0.2)]">
                      <Icon size={24} className="text-[#E8A020] mb-1" />
                      <span className="font-mono text-[#E8A020]/50 text-xs tracking-wider">
                        {step.number}
                      </span>
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#E8A020] flex items-center justify-center">
                      <span className="font-display text-[#0A1628] text-xs leading-none">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-[#0A1628] text-xl mb-3 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-[#0A1628]/60 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={scrollToContact}
            className="btn-amber px-10 py-4 rounded-sm text-base inline-flex items-center gap-3"
          >
            Start Your Application Today
          </button>
          <p className="text-[#0A1628]/40 text-xs mt-3">
            No credit pull required to get started.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
