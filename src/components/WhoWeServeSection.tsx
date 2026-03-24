/*
 * WhoWeServeSection — Southern Ground Capital
 * StoryBrand: "Pre-qualify" — who we work best with + final CTA
 */

import Link from "next/link";
import { ArrowRight, Home, Repeat2, BarChart3, Calculator } from "lucide-react";

const profiles = [
  {
    icon: Home,
    label: "1–4 Unit Investors",
    description: "Buying residential investment properties and need fast, flexible funding.",
  },
  {
    icon: Repeat2,
    label: "Fix & Flip Operators",
    description: "Doing 1–10+ deals a year and need a lender who keeps up with your pace.",
  },
  {
    icon: BarChart3,
    label: "Rental Portfolio Builders",
    description: "Growing a cash-flow portfolio and want long-term DSCR financing.",
  },
  {
    icon: Calculator,
    label: "Investors Who Know Their Numbers",
    description: "You understand your ARV, your spread, and your exit. We move when you're ready.",
  },
];

export function WhoWeServeSection() {
  return (
    <section className="py-20 bg-[#0F2040]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Who We Work Best With */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#E8A020]" />
              <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                Who We Work Best With
              </span>
            </div>
            <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mb-6">
              WE&apos;RE A STRONG FIT<br />
              <span className="text-[#E8A020]">IF YOU&apos;RE A…</span>
            </h2>

            <div className="space-y-4">
              {profiles.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#E8A020]/20 transition-colors">
                      <Icon size={16} className="text-[#E8A020]" />
                    </div>
                    <div>
                      <h4 className="font-display text-white text-base leading-tight mb-1">{item.label}</h4>
                      <p className="text-white/50 text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Final CTA */}
          <div className="bg-[#0A1628] border border-[#E8A020]/20 rounded-sm p-8 md:p-10">
            <div className="sgc-amber-bar mb-2">
              <h3 className="font-display text-white text-2xl md:text-3xl leading-tight">
                READY TO FUND<br />YOUR NEXT DEAL?
              </h3>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mt-4 mb-8">
              Submit your deal or get pre-approved today. Our team responds within 24 hours — no credit pull required to get started.
            </p>

            <div className="space-y-3">
              <Link
                href="/contact"
                className="btn-amber w-full py-3.5 rounded-sm text-sm inline-flex items-center justify-center gap-2"
              >
                Submit Your Deal <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="block w-full py-3.5 rounded-sm text-sm text-center border border-white/20 text-white/70 hover:border-[#E8A020]/40 hover:text-white transition-colors"
              >
                Get Pre-Approved Today
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 text-center sm:text-left">
              <a
                href="mailto:loans@sgcapital.io"
                className="text-[#E8A020] text-sm hover:text-[#F0B840] transition-colors font-mono"
              >
                loans@sgcapital.io
              </a>
              <span className="hidden sm:block text-white/20">·</span>
              <a
                href="tel:+16788428084"
                className="text-white/60 text-sm hover:text-white transition-colors font-mono"
              >
                (678) 842-8084
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhoWeServeSection;
