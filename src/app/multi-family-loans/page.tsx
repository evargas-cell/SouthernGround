import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/ContactSection";
import { Testimonials } from "@/components/Testimonials";
import { HowItWorks } from "@/components/HowItWorks";

export const metadata: Metadata = {
  title: "Multi-Family Loans | 2–20 Unit Investment Property Financing",
  description:
    "Multi-family loans for 2–20 unit investment properties. Up to 75% LTV, 12–36 month terms, close in 10–14 days. Southern Ground Capital — your direct multi-family lender.",
  alternates: { canonical: "https://sgcapital.io/multi-family-loans" },
  openGraph: {
    title: "Multi-Family Loans | Southern Ground Capital",
    description: "2–20 units. Up to 75% LTV. Close in 10–14 days.",
    url: "https://sgcapital.io/multi-family-loans",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LoanOrCredit",
  name: "Multi-Family Loan",
  provider: { "@type": "FinancialService", name: "Southern Ground Capital" },
  description: "Bridge and term financing for 2–20 unit multi-family investment properties.",
  loanTerm: { "@type": "QuantitativeValue", minValue: 12, maxValue: 36, unitCode: "MON" },
  loanType: "Multi-Family Loan",
};

export default function MultiFamilyLoansPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="sgc-amber-bar mb-6">
              <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Loan Program</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">MULTI-FAMILY<br />LOANS</h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-10">
              Acquire and renovate 2–20 unit investment properties with flexible bridge financing. Scale your portfolio with a lender who understands multifamily.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Units", value: "2–20" },
                { label: "Max LTV", value: "75%" },
                { label: "Term", value: "12–36 Mo" },
                { label: "Close In", value: "10–14 Days" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-lg p-5 text-center">
                  <div className="font-mono-nums text-3xl text-amber-400 mb-1">{s.value}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">LOAN DETAILS</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Unit Range</span><span className="text-amber-400 font-semibold">2–20 Units</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Max LTV</span><span className="text-amber-400 font-semibold">Up to 75%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Loan Term</span><span className="text-amber-400 font-semibold">12–36 Months</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Close Time</span><span className="text-amber-400 font-semibold">10–14 Days</span></li>
                  <li className="flex justify-between"><span>Property Types</span><span className="text-amber-400 font-semibold">Residential Multifamily</span></li>
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">WHO IT&apos;S FOR</h2>
                <ul className="space-y-3 text-gray-300">
                  {[
                    "Value-add apartment investors",
                    "Duplex/triplex/quadplex buyers",
                    "Small apartment complex acquisitions",
                    "Investors scaling their rental portfolio",
                    "Repositioning distressed multifamily",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        <HowItWorks />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
