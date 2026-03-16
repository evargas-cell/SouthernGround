/*
 * Home — Southern Ground Capital
 * Design: Industrial Precision — dark navy, amber accents
 * Full landing page assembling all sections
 */

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LoanPrograms from "@/components/LoanPrograms";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";
import LoanCalculator from "@/components/LoanCalculator";
import Testimonials from "@/components/Testimonials";
import ServiceArea from "@/components/ServiceArea";
import ContactSection from "@/components/ContactSection";
import BrokerSection from "@/components/BrokerSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <LoanPrograms />
      <HowItWorks />
      <WhyChooseUs />
      <LoanCalculator />
      <Testimonials />
      <ServiceArea />
      <BrokerSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
