/*
 * ProofSection — Southern Ground Capital
 * StoryBrand: "Proof" — recent deal example to build credibility
 */

import { TrendingUp, Home, Hammer, DollarSign } from "lucide-react";

const dealStats = [
  { icon: Home, label: "Purchase Price", value: "$185,000" },
  { icon: Hammer, label: "Rehab Budget", value: "$45,000" },
  { icon: TrendingUp, label: "After Repair Value", value: "$310,000" },
  { icon: DollarSign, label: "Loan Amount", value: "$166,500" },
];

export function ProofSection() {
  return (
    <section className="py-20 bg-[#0A1628]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Section Label + Context */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#E8A020]" />
              <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                Recent Deal Example
              </span>
            </div>
            <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mb-6">
              REAL RESULTS.<br />
              <span className="text-[#E8A020]">REAL INVESTORS.</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md">
              A Georgia-based investor came to us with a tight timeline and a solid deal. We funded within the week — no surprises, no retrading. Four months later, they walked away with a profit without tying up a dollar of personal capital.
            </p>

            {/* Result Callout */}
            <div className="bg-[#E8A020]/10 border border-[#E8A020]/30 rounded-sm p-5 max-w-sm">
              <div className="text-[#E8A020] text-xs font-mono tracking-widest uppercase mb-2">Outcome</div>
              <p className="text-white text-sm leading-relaxed">
                Investor secured profit <span className="text-[#E8A020] font-semibold">sold in 4 months</span> — without tying up personal capital.
              </p>
            </div>
          </div>

          {/* Right: Deal Numbers */}
          <div>
            <div className="bg-[#0F2040] border border-[#E8A020]/20 rounded-sm overflow-hidden">
              <div className="bg-[#162B52] px-6 py-4 border-b border-[#E8A020]/15">
                <span className="text-[#E8A020] text-[10px] font-mono tracking-[0.25em] uppercase">Deal Breakdown</span>
              </div>
              <div className="divide-y divide-white/10">
                {dealStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/20 flex items-center justify-center">
                          <Icon size={14} className="text-[#E8A020]" />
                        </div>
                        <span className="text-white/60 text-sm">{item.label}</span>
                      </div>
                      <span className="font-mono-nums text-white text-base font-semibold">{item.value}</span>
                    </div>
                  );
                })}
              </div>
              <div className="bg-[#E8A020]/5 border-t border-[#E8A020]/20 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/50 text-xs font-mono tracking-wider uppercase mb-0.5">Exit Strategy</div>
                    <div className="text-white text-sm font-semibold">Sold After Renovation</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/50 text-xs font-mono tracking-wider uppercase mb-0.5">Time to Exit</div>
                    <div className="text-[#E8A020] text-sm font-semibold">4 Months</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProofSection;
