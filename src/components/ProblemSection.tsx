/*
 * ProblemSection — Southern Ground Capital
 * StoryBrand: "The Problem" — speak to the investor's pain
 */

import { Clock, FileText, AlertTriangle } from "lucide-react";

const problems = [
  {
    icon: Clock,
    headline: "Banks take 30–60 days",
    body: "By the time a bank approves your deal, the seller has moved on. Traditional timelines kill real estate opportunities.",
  },
  {
    icon: FileText,
    headline: "Red tape at every turn",
    body: "Tax returns. W2s. Proof of income. Traditional lenders treat investors like homebuyers—but your deal doesn't fit their box.",
  },
  {
    icon: AlertTriangle,
    headline: "Hard money lenders retrade",
    body: "They say "yes" to get you in the door, then change the terms at the last minute—leaving you scrambling at closing.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 bg-[#0A1628] border-t border-white/10">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
              The Problem
            </span>
          </div>
          <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mb-4">
            INVESTORS DON&apos;T LOSE DEALS<br />
            <span className="text-[#E8A020]">BECAUSE OF BAD OPPORTUNITIES.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            They lose them because of slow, restrictive capital. The financing world wasn&apos;t built for investors who move fast.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {problems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.headline}
                className="bg-[#162B52]/60 border border-white/10 rounded-sm p-6"
              >
                <div className="w-10 h-10 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-red-400" />
                </div>
                <h3 className="font-display text-white text-lg mb-2">{item.headline}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>

        {/* The Consequence */}
        <div className="border-l-4 border-[#E8A020] pl-6 py-2">
          <p className="text-white text-xl md:text-2xl font-display leading-snug">
            By the time funding is ready—
            <span className="text-[#E8A020]"> the deal is gone.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
