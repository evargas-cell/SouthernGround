'use client';

/*
 * LoanPrograms — Southern Ground Capital
 * Design: Industrial Precision — dark navy cards with amber accents
 * Grid of loan product cards with key details
 */

import { useState } from "react";
import { ArrowRight, Hammer, TrendingUp, Building2, HardHat, RefreshCw, DollarSign } from "lucide-react";

const FIX_FLIP_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/95558444/SRpei9L9RnhAsFaEksuafb/sgc-fixflip-n7gCZBHQP5cowTiQxhEhJa.webp";
const CONSTRUCTION_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/95558444/SRpei9L9RnhAsFaEksuafb/sgc-construction-ZUDXH9YMRKEEudBEUX4FSB.webp";

const programs = [
  {
    id: "fix-flip",
    icon: Hammer,
    title: "Fix & Flip",
    tagline: "Buy, Renovate, Profit.",
    description:
      "Fast capital for property acquisition and renovation. We fund up to 90% LTC and 75% ARV so you can move quickly on the best deals.",
    details: [
      { label: "Loan-to-Cost", value: "Up to 90%" },
      { label: "ARV", value: "Up to 75%" },
      { label: "Term", value: "6–18 Months" },
      { label: "Close Time", value: "As Fast as 5 Days" },
    ],
    image: FIX_FLIP_IMAGE,
    featured: true,
  },
  {
    id: "dscr",
    icon: TrendingUp,
    title: "DSCR Loans",
    tagline: "Qualify on Cash Flow, Not Income.",
    description:
      "Debt Service Coverage Ratio loans for rental property investors. No personal income verification required — qualify based on the property's rental income.",
    details: [
      { label: "Min. DSCR", value: "1.0x" },
      { label: "LTV", value: "Up to 80%" },
      { label: "Term", value: "30-Year Fixed" },
      { label: "Min. Loan", value: "$75,000" },
    ],
    image: null,
    featured: false,
  },
  {
    id: "bridge",
    icon: RefreshCw,
    title: "Bridge Loans",
    tagline: "Bridge the Gap. Seize the Deal.",
    description:
      "Short-term bridge financing for transitional properties. Ideal for investors who need to close fast while arranging permanent financing.",
    details: [
      { label: "LTV", value: "Up to 75%" },
      { label: "Term", value: "3–24 Months" },
      { label: "Rates", value: "From 10.99%" },
      { label: "Close Time", value: "7–10 Days" },
    ],
    image: null,
    featured: false,
  },
  {
    id: "new-construction",
    icon: HardHat,
    title: "New Construction",
    tagline: "Ground-Up Financing Done Right.",
    description:
      "Fund your ground-up construction projects with draw-based financing. We work with builders and developers on residential and small commercial projects.",
    details: [
      { label: "Loan-to-Cost", value: "Up to 85%" },
      { label: "Term", value: "12–24 Months" },
      { label: "Draw Schedule", value: "Flexible" },
      { label: "Min. Loan", value: "$150,000" },
    ],
    image: CONSTRUCTION_IMAGE,
    featured: false,
  },
  {
    id: "multifamily",
    icon: Building2,
    title: "Multi-Family",
    tagline: "Scale Your Portfolio.",
    description:
      "Financing for 2–20 unit residential investment properties. Whether you're acquiring, refinancing, or value-adding, we have a program for you.",
    details: [
      { label: "Units", value: "2–20 Units" },
      { label: "LTV", value: "Up to 75%" },
      { label: "Term", value: "12–36 Months" },
      { label: "Close Time", value: "10–14 Days" },
    ],
    image: null,
    featured: false,
  },
  {
    id: "cashout",
    icon: DollarSign,
    title: "Cash-Out Refi",
    tagline: "Unlock Your Equity.",
    description:
      "Access the equity in your existing investment properties. Use the cash for new acquisitions, renovations, or business capital.",
    details: [
      { label: "Max LTV", value: "70%" },
      { label: "Term", value: "12–24 Months" },
      { label: "Min. Equity", value: "30%" },
      { label: "Close Time", value: "7–14 Days" },
    ],
    image: null,
    featured: false,
  },
];

export function LoanPrograms() {
  const [activeProgram, setActiveProgram] = useState<string | null>(null);

  const scrollToContact = () => {
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="loan-programs" className="py-24 bg-[#0A1628]">
      <div className="container">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
              Loan Programs
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="font-display text-white text-4xl md:text-5xl leading-tight">
              CAPITAL FOR EVERY<br />
              <span className="text-[#E8A020]">REAL ESTATE STRATEGY</span>
            </h2>
            <p className="text-white/60 max-w-sm text-sm leading-relaxed">
              From quick flips to long-term rentals, Southern Ground Capital has a lending solution built for serious investors.
            </p>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {programs.map((program) => {
            const Icon = program.icon;
            const isActive = activeProgram === program.id;
            return (
              <div
                key={program.id}
                className={`loan-card rounded-sm overflow-hidden cursor-pointer ${
                  program.featured ? "md:col-span-2 xl:col-span-1" : ""
                }`}
                onClick={() => setActiveProgram(isActive ? null : program.id)}
              >
                {/* Card Image (if available) */}
                {program.image && (
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2040] to-transparent" />
                  </div>
                )}

                <div className="p-6">
                  {/* Icon + Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/30 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-[#E8A020]" />
                      </div>
                      <div>
                        <h3 className="font-display text-white text-xl leading-tight">
                          {program.title}
                        </h3>
                        <p className="text-[#E8A020] text-xs font-mono mt-0.5">
                          {program.tagline}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className={`text-[#E8A020]/50 flex-shrink-0 transition-transform duration-300 ${
                        isActive ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    {program.description}
                  </p>

                  {/* Details Grid */}
                  <div
                    className={`grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300 ${
                      isActive ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {program.details.map((detail) => (
                      <div
                        key={detail.label}
                        className="bg-[#0A1628]/60 border border-[#E8A020]/10 rounded-sm p-2.5"
                      >
                        <div className="text-white/40 text-[10px] font-mono tracking-wider uppercase">
                          {detail.label}
                        </div>
                        <div className="text-[#E8A020] font-mono-nums text-sm font-bold mt-0.5">
                          {detail.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isActive ? "max-h-16 opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToContact();
                      }}
                      className="btn-amber w-full py-2.5 rounded-sm text-xs flex items-center justify-center gap-2"
                    >
                      Apply for {program.title}
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Expand hint */}
                  {!isActive && (
                    <div className="text-white/30 text-xs mt-3 flex items-center gap-1">
                      <span>View details</span>
                      <ArrowRight size={11} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm mb-4">
            Not sure which program fits your deal?
          </p>
          <button
            onClick={scrollToContact}
            className="btn-outline-amber px-8 py-3 rounded-sm text-sm inline-flex items-center gap-2"
          >
            Talk to a Loan Specialist
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default LoanPrograms;
