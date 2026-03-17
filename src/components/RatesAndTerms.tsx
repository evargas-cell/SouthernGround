'use client';

/*
 * RatesAndTerms — Southern Ground Capital
 * Design: Industrial Precision — full rate/term matrix for all loan programs
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const programs = [
  {
    name: "Fix & Flip",
    href: "/fix-and-flip-loans",
    tag: "Most Popular",
    rows: [
      { label: "Interest Rate", value: "From 8.25%*" },
      { label: "Loan-to-Cost (LTC)", value: "Up to 90%" },
      { label: "After-Repair LTV (ARLTV)", value: "Up to 75%" },
      { label: "Rehab Financing", value: "Up to 100% of Budget" },
      { label: "Loan Term", value: "12 Months (18 Mo. Available)" },
      { label: "Loan Amount", value: "$50K – $3M" },
      { label: "Experience Required", value: "None" },
      { label: "Recourse", value: "Full Recourse" },
    ],
  },
  {
    name: "Ground Up",
    href: "/new-construction-loans",
    tag: "Ground-Up",
    rows: [
      { label: "Interest Rate", value: "From 8.99%*" },
      { label: "Max Loan-to-Cost (LTC)", value: "Up to 85% of Total Costs" },
      { label: "Max Loan-to-ARV", value: "Up to 70%" },
      { label: "Construction Financing", value: "100% of Construction" },
      { label: "Loan Term", value: "12–24 Months" },
      { label: "Loan Amount", value: "$50K – $3M" },
      { label: "Experience Required", value: "1–2 Ground-Up Builds" },
      { label: "Recourse", value: "Full Recourse" },
    ],
  },
  {
    name: "Stabilized Bridge",
    href: "/bridge-loans",
    tag: "Bridge",
    rows: [
      { label: "Interest Rate", value: "From 8.25%*" },
      { label: "Max Loan-to-Value (LTV)", value: "Up to 70%" },
      { label: "Max Loan-to-Cost (LTC)", value: "85% of Purchase + CapEx" },
      { label: "Min. DSCR (Rental Exit)", value: "1.10x" },
      { label: "Loan Term", value: "12 Months (Up to 18)" },
      { label: "Loan Amount", value: "$50K – $3M" },
      { label: "Min. FICO", value: "660" },
      { label: "Recourse", value: "Full Recourse" },
    ],
  },
  {
    name: "Single Property Rentals",
    href: "/dscr-loans",
    tag: "Long-Term",
    rows: [
      { label: "Interest Rate", value: "From 5.39%*" },
      { label: "Max Loan-to-Value (LTV)", value: "80% Purchase/Refi · 75% Cash-Out" },
      { label: "Min. DSCR", value: "1.05x (Gross Rent / PITIA)" },
      { label: "Loan Types", value: "30-Yr Fixed · 5/6, 7/6, 10/6 ARMs" },
      { label: "Loan Term", value: "30 Years" },
      { label: "Loan Amount", value: "$75K – $2M" },
      { label: "Min. FICO", value: "660 (Mid-Score)" },
      { label: "Recourse", value: "Full Recourse" },
    ],
  },
  {
    name: "Rental Portfolios",
    href: "/rental-portfolio-loans",
    tag: "Portfolio",
    rows: [
      { label: "Interest Rate", value: "From 5.39%*" },
      { label: "Max Loan-to-Value (LTV)", value: "80% Purchase/Refi · 75% Cash-Out" },
      { label: "Min. DSCR", value: "1.05x (≤$2M / ≤10 props) · 1.20x (all others)" },
      { label: "Min. Occupancy", value: "90% by Unit Count" },
      { label: "Loan Amount", value: "Min. Property Value: $100K · Max: $2M" },
      { label: "Loan Term", value: "30 Years" },
      { label: "Min. FICO", value: "680 (Mid-Score)" },
      { label: "Recourse", value: "Full Recourse" },
    ],
  },
];

const generalTerms = [
  { label: "Property Types", value: "SFR, 2–4 Unit, Townhomes, Warrantable Condos, PUD" },
  { label: "Borrower Entity", value: "Entity Required (LLC, Corp, Partnership)" },
  { label: "Min. Credit Score", value: "660–680 depending on program" },
  { label: "Loan Purpose", value: "Purchase, Rate/Term Refi, Cash-Out, Rehab, Construction" },
  { label: "Occupancy", value: "Non-Owner Occupied / Investment Only" },
  { label: "Rural Properties", value: "Not Permitted" },
  { label: "Title Insurance", value: "Required" },
  { label: "Recourse", value: "Full Recourse on All Programs" },
];

export function RatesAndTerms() {
  return (
    <>
      {/* Rate Matrix */}
      <section className="py-24 bg-[#0A1628]">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">Program Comparison</span>
          </div>
          <h2 className="font-display text-white text-4xl md:text-5xl mb-4">RATES &amp; TERMS<br />BY PROGRAM</h2>
          <p className="text-white/50 text-sm max-w-2xl mb-12">
            All rates and terms are subject to change. Final pricing depends on LTV, property type, borrower experience, and market conditions. Contact us for a deal-specific quote.
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.href}
                className="bg-[#0F2040] border border-[#E8A020]/20 rounded-sm overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-[#E8A020]/10 border-b border-[#E8A020]/20 px-5 py-4 flex items-center justify-between">
                  <h3 className="font-display text-white text-lg">{program.name}</h3>
                  <span className="text-[#E8A020] text-[10px] font-mono tracking-widest uppercase bg-[#E8A020]/10 border border-[#E8A020]/30 px-2 py-0.5 rounded-sm">
                    {program.tag}
                  </span>
                </div>

                {/* Term Rows */}
                <div className="px-5 py-4 flex-1 space-y-2.5">
                  {program.rows.map((row) => (
                    <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                      <span className="text-white/40 text-xs">{row.label}</span>
                      <span className="text-[#E8A020] text-xs font-semibold font-mono">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-5 py-4 border-t border-white/10">
                  <Link
                    href={program.href}
                    className="flex items-center gap-1.5 text-[#E8A020] text-xs font-semibold hover:text-[#F0B840] transition-colors"
                  >
                    View Full Program Details <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General Terms */}
      <section className="py-20 bg-[#0F2040]">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">Across All Programs</span>
          </div>
          <h2 className="font-display text-white text-4xl mb-10">GENERAL TERMS</h2>

          <div className="bg-[#0A1628] border border-[#E8A020]/20 rounded-sm overflow-hidden">
            {generalTerms.map((row, i) => (
              <div
                key={row.label}
                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 px-6 py-4 ${
                  i < generalTerms.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <span className="text-white/50 text-sm">{row.label}</span>
                <span className="text-white text-sm font-medium sm:text-right max-w-xs">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 bg-[#0A1628] border-t border-white/5">
        <div className="container max-w-4xl">
          <p className="text-white/25 text-xs leading-relaxed text-center">
            *Rates advertised are the lowest offered. Actual rates and offers may vary based on approval criteria, including but not limited to borrower FICO score, previous experience, period of ownership, etc. All loans are for investment purposes only and are not available for owner-occupied residential properties. Terms subject to change without notice. This is not a commitment to lend.
          </p>
        </div>
      </section>
    </>
  );
}

export default RatesAndTerms;
