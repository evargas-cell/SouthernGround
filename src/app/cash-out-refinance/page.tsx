import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/ContactSection";
import { Testimonials } from "@/components/Testimonials";
import { HowItWorks } from "@/components/HowItWorks";

export const metadata: Metadata = {
  title: "Cash-Out Refinance | Access Equity in Investment Properties",
  description:
    "Cash-out refinance loans from Southern Ground Capital. Up to 70% LTV, min 30% equity, close in 7–14 days. Unlock equity in your investment properties to fund your next deal.",
  alternates: { canonical: "https://sgcapital.io/cash-out-refinance" },
  openGraph: {
    title: "Cash-Out Refinance | Southern Ground Capital",
    description: "Up to 70% LTV. Min 30% equity. Close in 7–14 days.",
    url: "https://sgcapital.io/cash-out-refinance",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LoanOrCredit",
  name: "Cash-Out Refinance Loan",
  provider: { "@type": "FinancialService", name: "Southern Ground Capital" },
  description: "Cash-out refinance loans allowing investors to access equity in investment properties.",
  loanTerm: { "@type": "QuantitativeValue", minValue: 12, maxValue: 24, unitCode: "MON" },
  loanType: "Refinance Loan",
};

export default function CashOutRefinancePage() {
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
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">CASH-OUT<br />REFINANCE</h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-10">
              Unlock the equity in your existing investment properties to fund your next acquisition or renovation. Fast, flexible, and no income verification required.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Max LTV", value: "70%" },
                { label: "Term", value: "12–24 Mo" },
                { label: "Min Equity", value: "30%" },
                { label: "Close In", value: "7–14 Days" },
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
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Max LTV</span><span className="text-amber-400 font-semibold">Up to 70%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Loan Term</span><span className="text-amber-400 font-semibold">12–24 Months</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Min Equity Required</span><span className="text-amber-400 font-semibold">30%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Close Time</span><span className="text-amber-400 font-semibold">7–14 Days</span></li>
                  <li className="flex justify-between"><span>Income Verification</span><span className="text-amber-400 font-semibold">None Required</span></li>
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">WHO IT&apos;S FOR</h2>
                <ul className="space-y-3 text-gray-300">
                  {[
                    "Investors with equity in paid-down properties",
                    "Landlords funding the next acquisition",
                    "Borrowers pulling cash for renovations",
                    "Debt consolidation for investment portfolios",
                    "Self-employed investors avoiding bank docs",
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
