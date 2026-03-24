import type { Metadata } from "next";
import { AffiliateSignup } from "@/components/AffiliateSignup";

export const metadata: Metadata = {
  title: "Affiliate Program | Southern Ground Capital",
  description:
    "Join the Southern Ground Capital affiliate program. Earn referral commissions by connecting real estate investors with our loan programs.",
  alternates: { canonical: "https://sgcapital.io/affiliates" },
  openGraph: {
    title: "Affiliate Program | Southern Ground Capital",
    description: "Earn referral commissions by partnering with Southern Ground Capital.",
    url: "https://sgcapital.io/affiliates",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
    { "@type": "ListItem", position: 2, name: "Affiliate Program", item: "https://sgcapital.io/affiliates" },
  ],
};

export default function AffiliatesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">
              AFFILIATE<br />PROGRAM
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Partner with us and earn referral commissions on every deal you bring to Southern Ground Capital.
            </p>
          </div>
        </section>
        <AffiliateSignup />
      </main>
    </>
  );
}
