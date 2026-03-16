import type { Metadata } from "next";
import { ContactSection } from "@/components/ContactSection";
import { Testimonials } from "@/components/Testimonials";
import { HowItWorks } from "@/components/HowItWorks";
import { RelatedPrograms } from "@/components/RelatedPrograms";

export const metadata: Metadata = {
  title: "DSCR Loans | Debt Service Coverage Ratio Loans for Investors",
  description:
    "DSCR loans from Southern Ground Capital. No income verification, qualify on rental income. Min 1.0x DSCR, up to 80% LTV, 30-year fixed terms available.",
  alternates: { canonical: "https://sgcapital.io/dscr-loans" },
  openGraph: {
    title: "DSCR Loans | Southern Ground Capital",
    description: "Qualify on rental income. No W-2 required. Up to 80% LTV.",
    url: "https://sgcapital.io/dscr-loans",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSCR Loans | No Income Verification | Southern Ground Capital",
    description:
      "Qualify on rental income — no W-2, no tax returns. Up to 80% LTV, 30-year fixed terms. Southern Ground Capital DSCR lending.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LoanOrCredit",
      name: "DSCR Loan",
      provider: { "@type": "FinancialService", name: "Southern Ground Capital" },
      description:
        "Debt Service Coverage Ratio loans for real estate investors — qualify on property cash flow, no personal income verification required.",
      amount: { "@type": "MonetaryAmount", minValue: 75000, currency: "USD" },
      loanTerm: { "@type": "QuantitativeValue", value: 360, unitCode: "MON" },
      loanType: "DSCR Loan",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
        {
          "@type": "ListItem",
          position: 2,
          name: "DSCR Loans",
          item: "https://sgcapital.io/dscr-loans",
        },
      ],
    },
  ],
};

export default function DscrLoansPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="sgc-amber-bar mb-6">
              <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Loan Program</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">DSCR LOANS</h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-10">
              Qualify based on your property&apos;s rental income — not your personal tax returns. Perfect for self-employed investors and portfolio builders.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Min DSCR", value: "1.0x" },
                { label: "Max LTV", value: "80%" },
                { label: "Term", value: "30-Yr" },
                { label: "Min Loan", value: "$75K" },
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
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Minimum DSCR</span><span className="text-amber-400 font-semibold">1.0x</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Max LTV</span><span className="text-amber-400 font-semibold">Up to 80%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Loan Term</span><span className="text-amber-400 font-semibold">30-Year Fixed</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Min Loan Amount</span><span className="text-amber-400 font-semibold">$75,000</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Income Verification</span><span className="text-amber-400 font-semibold">None Required</span></li>
                  <li className="flex justify-between"><span>Property Types</span><span className="text-amber-400 font-semibold">SFR, 2–4 Units</span></li>
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">WHO IT&apos;S FOR</h2>
                <ul className="space-y-3 text-gray-300">
                  {[
                    "Self-employed investors with complex tax returns",
                    "Portfolio landlords building long-term wealth",
                    "Investors seeking 30-year fixed stability",
                    "Borrowers with strong rental properties",
                    "Those who prefer property-based qualification",
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
        <RelatedPrograms exclude="/dscr-loans" />
        <ContactSection defaultLoanType="DSCR Loan" />
      </main>
    </>
  );
}
