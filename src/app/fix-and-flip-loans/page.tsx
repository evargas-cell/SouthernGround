import type { Metadata } from "next";
import { ContactSection } from "@/components/ContactSection";
import { Testimonials } from "@/components/Testimonials";
import { HowItWorks } from "@/components/HowItWorks";
import { RelatedPrograms } from "@/components/RelatedPrograms";

export const metadata: Metadata = {
  title: "Fix and Flip Loans | Up to 90% LTC, 75% ARV | Fast Approval",
  description:
    "Southern Ground Capital fix and flip loans: up to 90% LTC, 75% ARV, rates from 10.99%, close in as fast as 5 days. Fund your next rehab project with confidence.",
  alternates: { canonical: "https://sgcapital.io/fix-and-flip-loans" },
  openGraph: {
    title: "Fix and Flip Loans | Southern Ground Capital",
    description: "Up to 90% LTC, 75% ARV. Close in as fast as 5 days.",
    url: "https://sgcapital.io/fix-and-flip-loans",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fix & Flip Loans | Up to 90% LTC | Southern Ground Capital",
    description:
      "Up to 90% LTC, 75% ARV. Close in as fast as 5 days. Expert fix and flip financing from a direct lender.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LoanOrCredit",
      name: "Fix and Flip Loan",
      provider: { "@type": "FinancialService", name: "Southern Ground Capital" },
      description:
        "Short-term financing for residential real estate investors purchasing and renovating properties.",
      amount: { "@type": "MonetaryAmount", minValue: 50000, currency: "USD" },
      loanTerm: { "@type": "QuantitativeValue", minValue: 6, maxValue: 18, unitCode: "MON" },
      annualPercentageRate: "10.99",
      loanType: "Hard Money Loan",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Fix & Flip Loans",
          item: "https://sgcapital.io/fix-and-flip-loans",
        },
      ],
    },
  ],
};

export default function FixAndFlipLoansPage() {
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
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">
              FIX &amp; FLIP<br />LOANS
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-10">
              Short-term financing built for real estate investors. Close fast, renovate confidently, and maximize your returns with up to 90% LTC and 75% ARV.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Max LTC", value: "90%" },
                { label: "Max ARV", value: "75%" },
                { label: "Rate From", value: "10.99%" },
                { label: "Close In", value: "5 Days" },
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
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Loan-to-Cost (LTC)</span><span className="text-amber-400 font-semibold">Up to 90%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>After-Repair Value (ARV)</span><span className="text-amber-400 font-semibold">Up to 75%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Loan Term</span><span className="text-amber-400 font-semibold">6–18 Months</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Interest Rate</span><span className="text-amber-400 font-semibold">From 10.99%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Close Time</span><span className="text-amber-400 font-semibold">As Fast as 5 Days</span></li>
                  <li className="flex justify-between"><span>Loan Amount</span><span className="text-amber-400 font-semibold">$50K–$5M</span></li>
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">WHO IT&apos;S FOR</h2>
                <ul className="space-y-3 text-gray-300">
                  {[
                    "Experienced flippers needing fast capital",
                    "Investors targeting distressed properties",
                    "Borrowers who need bridge-to-sale financing",
                    "Projects requiring renovation draws",
                    "First-time flippers with a solid exit strategy",
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
        <RelatedPrograms exclude="/fix-and-flip-loans" />
        <ContactSection defaultLoanType="Fix & Flip" />
      </main>
    </>
  );
}
