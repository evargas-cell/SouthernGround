import type { Metadata } from "next";
import { ContactSection } from "@/components/ContactSection";
import { Testimonials } from "@/components/Testimonials";
import { HowItWorks } from "@/components/HowItWorks";
import { RelatedPrograms } from "@/components/RelatedPrograms";

export const metadata: Metadata = {
  title: "Bridge Loans | Short-Term Real Estate Bridge Financing",
  description:
    "Bridge loans from Southern Ground Capital. Up to 75% LTV, rates from 10.99%, close in 7–10 days. Bridge the gap between purchase and permanent financing.",
  alternates: { canonical: "https://sgcapital.io/bridge-loans" },
  openGraph: {
    title: "Bridge Loans | Southern Ground Capital",
    description: "Up to 75% LTV. Close in 7–10 days. Rates from 10.99%.",
    url: "https://sgcapital.io/bridge-loans",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridge Loans | 75% LTV | Close in 7–10 Days | Southern Ground Capital",
    description:
      "Move fast on acquisitions with bridge financing. Up to 75% LTV, rates from 10.99%, close in 7–10 days.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LoanOrCredit",
      name: "Bridge Loan",
      provider: { "@type": "FinancialService", name: "Southern Ground Capital" },
      description:
        "Short-term bridge financing to acquire properties or bridge to permanent financing.",
      loanTerm: { "@type": "QuantitativeValue", minValue: 3, maxValue: 24, unitCode: "MON" },
      annualPercentageRate: "10.99",
      loanType: "Bridge Loan",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Bridge Loans",
          item: "https://sgcapital.io/bridge-loans",
        },
      ],
    },
  ],
};

export default function BridgeLoansPage() {
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
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">BRIDGE<br />LOANS</h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-10">
              Bridge the gap between opportunity and long-term financing. Move fast on acquisitions while you arrange permanent capital.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Max LTV", value: "75%" },
                { label: "Term", value: "3–24 Mo" },
                { label: "Rate From", value: "10.99%" },
                { label: "Close In", value: "7–10 Days" },
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
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Max LTV</span><span className="text-amber-400 font-semibold">Up to 75%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Loan Term</span><span className="text-amber-400 font-semibold">3–24 Months</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Interest Rate</span><span className="text-amber-400 font-semibold">From 10.99%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Close Time</span><span className="text-amber-400 font-semibold">7–10 Days</span></li>
                  <li className="flex justify-between"><span>Loan Amount</span><span className="text-amber-400 font-semibold">$100K–$10M</span></li>
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">WHO IT&apos;S FOR</h2>
                <ul className="space-y-3 text-gray-300">
                  {[
                    "Investors needing quick acquisition capital",
                    "Borrowers awaiting bank or SBA financing",
                    "1031 exchange transactions",
                    "Stabilization before permanent financing",
                    "Value-add commercial properties",
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
        <RelatedPrograms exclude="/bridge-loans" />
        <ContactSection defaultLoanType="Bridge Loan" />
      </main>
    </>
  );
}
