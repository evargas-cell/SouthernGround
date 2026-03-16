/*
 * RelatedPrograms — Southern Ground Capital
 * "Also consider..." section shown at the bottom of each loan program page
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const allPrograms = [
  {
    label: "Fix & Flip Loans",
    href: "/fix-and-flip-loans",
    desc: "Up to 90% LTC, 75% ARV",
    tag: "Short-Term",
  },
  {
    label: "DSCR Loans",
    href: "/dscr-loans",
    desc: "30-year terms, no income docs",
    tag: "Long-Term",
  },
  {
    label: "Bridge Loans",
    href: "/bridge-loans",
    desc: "3–24 months, from 10.99%",
    tag: "Bridge",
  },
  {
    label: "New Construction Loans",
    href: "/new-construction-loans",
    desc: "85% LTC, flexible draw schedule",
    tag: "Construction",
  },
  {
    label: "Multi-Family Loans",
    href: "/multi-family-loans",
    desc: "2–20 units, 75% LTV",
    tag: "Multi-Family",
  },
  {
    label: "Cash-Out Refinance",
    href: "/cash-out-refinance",
    desc: "Up to 70% LTV, access equity fast",
    tag: "Refinance",
  },
];

export function RelatedPrograms({ exclude }: { exclude: string }) {
  const related = allPrograms.filter((p) => p.href !== exclude).slice(0, 3);

  return (
    <section className="py-16 bg-[#0F2040]">
      <div className="container max-w-4xl">
        <div className="sgc-amber-bar mb-8">
          <h2 className="font-display text-white text-3xl">ALSO CONSIDER</h2>
          <p className="text-white/50 text-sm mt-1">
            Other loan programs that may fit your deal.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {related.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group bg-white/5 border border-white/10 hover:border-[#E8A020]/40 rounded-lg p-5 transition-all"
            >
              <div className="text-[#E8A020] text-[10px] font-mono tracking-widest uppercase mb-2">
                {p.tag}
              </div>
              <div className="text-white font-display text-lg group-hover:text-[#E8A020] transition-colors leading-tight">
                {p.label}
              </div>
              <div className="text-white/40 text-xs mt-1 leading-relaxed">{p.desc}</div>
              <div className="flex items-center gap-1 text-[#E8A020] text-xs mt-3 font-medium group-hover:gap-2 transition-all">
                Learn more <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RelatedPrograms;
