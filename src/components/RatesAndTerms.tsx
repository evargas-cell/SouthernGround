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
      { label: "Loan-to-Cost (LTC)", value: "Up to 90%" },
      { label: "After-Repair Value (ARV)", value: "Up to 75%" },
      { label: "Interest Rate", value: "From 10.99%" },
      { label: "Origination Fee", value: "1–3 Points" },
      { label: "Loan Term", value: "6–18 Months" },
      { label: "Loan Amount", value: "$50K – $5M" },
      { label: "Close Time", value: "As Fast as 5 Days" },
      { label: "Prepayment Penalty", value: "None" },
    ],
  },
  {
    name: "DSCR Loans",
    href: "/dscr-loans",
    tag: "Long-Term",
    rows: [
      { label: "Loan-to-Value (LTV)", value: "Up to 80%" },
      { label: "Income Verification", value: "None (DSCR Only)" },
      { label: "Interest Rate", value: "From 7.49%" },
      { label: "Origination Fee", value: "1–2 Points" },
      { label: "Loan Term", value: "30 Years" },
      { label: "Loan Amount", value: "$75K – $3M" },
      { label: "Min. DSCR", value: "1.0x" },
      { label: "Prepayment Penalty", value: "Varies" },
    ],
  },
  {
    name: "Bridge Loans",
    href: "/bridge-loans",
    tag: "Fast Close",
    rows: [
      { label: "Loan-to-Value (LTV)", value: "Up to 75%" },
      { label: "Interest Rate", value: "From 10.99%" },
      { label: "Origination Fee", value: "1–2 Points" },
      { label: "Loan Term", value: "3–24 Months" },
      { label: "Loan Amount", value: "$100K – $10M" },
      { label: "Close Time", value: "As Fast as 7 Days" },
      { label: "Extension Available", value: "Yes" },
      { label: "Prepayment Penalty", value: "None" },
    ],
  },
  {
    name: "New Construction",
    href: "/new-construction-loans",
    tag: "Ground-Up",
    rows: [
      { label: "Loan-to-Cost (LTC)", value: "Up to 85%" },
      { label: "ARV", value: "Up to 70%" },
      { label: "Interest Rate", value: "From 11.49%" },
      { label: "Origination Fee", value: "1.5–3 Points" },
      { label: "Loan Term", value: "12–24 Months" },
      { label: "Loan Amount", value: "$150K – $5M" },
      { label: "Draw Schedule", value: "Flexible" },
      { label: "Prepayment Penalty", value: "None" },
    ],
  },
  {
    name: "Multi-Family",
    href: "/multi-family-loans",
    tag: "2–20 Units",
    rows: [
      { label: "Loan-to-Value (LTV)", value: "Up to 75%" },
      { label: "Interest Rate", value: "From 10.49%" },
      { label: "Origination Fee", value: "1–2 Points" },
      { label: "Loan Term", value: "12–24 Months" },
      { label: "Loan Amount", value: "$150K – $10M" },
      { label: "Units", value: "2–20 Units" },
      { label: "Close Time", value: "10–14 Days" },
      { label: "Prepayment Penalty", value: "None" },
    ],
  },
  {
    name: "Cash-Out Refi",
    href: "/cash-out-refinance",
    tag: "No Income Check",
    rows: [
      { label: "Loan-to-Value (LTV)", value: "Up to 70%" },
      { label: "Min. Equity Required", value: "30%" },
      { label: "Interest Rate", value: "From 10.99%" },
      { label: "Origination Fee", value: "1–2 Points" },
      { label: "Loan Term", value: "12–24 Months" },
      { label: "Loan Amount", value: "$75K – $5M" },
      { label: "Income Verification", value: "None" },
      { label: "Prepayment Penalty", value: "None" },
    ],
  },
];

const generalTerms = [
  { label: "Property Types", value: "SFR, Multi-Family (2–20), Commercial, Mixed-Use" },
  { label: "Borrower Entity", value: "LLC, Corp, Partnership, Individual" },
  { label: "Credit Score", value: "620+ preferred (exceptions available)" },
  { label: "Appraisal", value: "Required on most loans; desk review eligible on some" },
  { label: "Title Insurance", value: "Required" },
  { label: "Geographic Footprint", value: "48 States (excl. AZ, NV, ND, OR, SD, UT, VT)" },
  { label: "Recourse", value: "Full recourse on all programs" },
  { label: "Extension", value: "Available on most programs for a fee" },
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
            * Rates and terms listed are indicative and subject to change without notice. Actual rates are determined by loan-to-value, property type, location, borrower credit and experience, and prevailing market conditions. All loans are for investment purposes only and are not available for owner-occupied residential properties. This is not a commitment to lend.
          </p>
        </div>
      </section>
    </>
  );
}

export default RatesAndTerms;
