/*
 * FailureSuccessSection — Southern Ground Capital
 * StoryBrand: Contrast "failure" (without us) vs "success" (with us)
 */

import { X, Check } from "lucide-react";

const failurePoints = [
  "You miss deals while waiting on slow capital",
  "You lose deposits when funding falls through",
  "You stay stuck doing fewer deals than you're capable of",
];

const successPoints = [
  "Move fast on opportunities before they're gone",
  "Scale your deal volume with reliable capital",
  "Build a portfolio without using your own cash",
];

export function FailureSuccessSection() {
  return (
    <section className="py-20 bg-[#F0F4F8]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
              Your Path Forward
            </span>
            <div className="h-px w-12 bg-[#E8A020]" />
          </div>
          <h2 className="font-display text-[#0A1628] text-4xl md:text-5xl leading-tight">
            THE STAKES ARE REAL.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Failure Column */}
          <div className="bg-white border border-red-200 rounded-sm overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <span className="text-white text-xs font-mono tracking-[0.2em] uppercase font-semibold">
                Without the Right Capital Partner
              </span>
            </div>
            <div className="p-6 space-y-4">
              {failurePoints.map((point) => (
                <div key={point} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X size={11} className="text-red-500" />
                  </div>
                  <p className="text-[#0A1628]/70 text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Success Column */}
          <div className="bg-[#0A1628] border border-[#E8A020]/30 rounded-sm overflow-hidden">
            <div className="bg-[#E8A020] px-6 py-4">
              <span className="text-[#0A1628] text-xs font-mono tracking-[0.2em] uppercase font-semibold">
                With Southern Ground Capital
              </span>
            </div>
            <div className="p-6 space-y-4">
              {successPoints.map((point) => (
                <div key={point} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8A020]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-[#E8A020]" />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FailureSuccessSection;
