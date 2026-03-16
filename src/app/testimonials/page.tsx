import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
};

export default function TestimonialsPage() {
  return (
    <>
      <Navbar />
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
      <Footer />
    </>
  );
}
