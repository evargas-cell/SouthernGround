import type { Metadata } from "next";
import { Testimonials } from "@/components/Testimonials";
import { ContactSection } from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Borrower Testimonials | Real Investors, Real Results",
  description:
    "Read what real estate investors say about Southern Ground Capital. Verified testimonials from borrowers who closed deals fast with our hard money loans.",
  alternates: { canonical: "https://sgcapital.io/testimonials" },
  openGraph: {
    title: "Testimonials | Southern Ground Capital",
    description: "Real investors, real results. See what our borrowers say.",
    url: "https://sgcapital.io/testimonials",
  },
  twitter: {
    card: "summary_large_image",
    title: "Borrower Testimonials | Southern Ground Capital",
    description: "Real investors share their experience. 5-star reviews from fix & flip, DSCR, and bridge loan borrowers.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
        { "@type": "ListItem", position: 2, name: "Testimonials", item: "https://sgcapital.io/testimonials" },
      ],
    },
    {
      "@type": "AggregateRating",
      itemReviewed: {
        "@type": "FinancialService",
        name: "Southern Ground Capital",
        url: "https://sgcapital.io",
      },
      ratingValue: "5",
      ratingCount: "5",
      bestRating: "5",
    },
    {
      "@type": "Review",
      reviewBody:
        "Southern Ground Capital funded my fix and flip in 6 days. I had another lender fall through at the last minute, and SGC stepped in and saved the deal. Their team was responsive, professional, and delivered exactly what they promised. I've done 4 deals with them since.",
      author: { "@type": "Person", name: "Marcus T." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      itemReviewed: { "@type": "FinancialService", name: "Southern Ground Capital" },
    },
    {
      "@type": "Review",
      reviewBody:
        "As a rental portfolio investor, the DSCR loan program was exactly what I needed. No W-2s, no tax returns — just the property's cash flow. SGC made it simple and closed in under 3 weeks. I've already refinanced two more properties through them.",
      author: { "@type": "Person", name: "Jennifer R." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      itemReviewed: { "@type": "FinancialService", name: "Southern Ground Capital" },
    },
    {
      "@type": "Review",
      reviewBody:
        "I've worked with a lot of hard money lenders over the years. Southern Ground Capital is different — they actually understand construction draws and timelines. The draw process was smooth, communication was excellent, and they funded every draw on schedule.",
      author: { "@type": "Person", name: "David K." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      itemReviewed: { "@type": "FinancialService", name: "Southern Ground Capital" },
    },
    {
      "@type": "Review",
      reviewBody:
        "I was skeptical at first, but SGC exceeded every expectation. The quote process was fast, the terms were competitive, and my loan specialist kept me informed every step of the way. This is how lending should work.",
      author: { "@type": "Person", name: "Angela M." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      itemReviewed: { "@type": "FinancialService", name: "Southern Ground Capital" },
    },
    {
      "@type": "Review",
      reviewBody:
        "Needed a bridge loan to close on a commercial property while my permanent financing was being arranged. SGC had me funded in 8 days. The rate was fair, the process was transparent, and there were zero surprises at closing.",
      author: { "@type": "Person", name: "Robert H." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      itemReviewed: { "@type": "FinancialService", name: "Southern Ground Capital" },
    },
  ],
};

export default function TestimonialsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">WHAT OUR<br />BORROWERS SAY</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real investors share their experience working with Southern Ground Capital. From first-time flippers to seasoned portfolio builders.
            </p>
          </div>
        </section>
        <Testimonials />
        <ContactSection />
      </main>
    </>
  );
}
