'use client';

/*
 * HeroSection — Southern Ground Capital
 * Design: Industrial Precision — full-bleed dark hero, amber accents
 * Large typographic statement + inline quote form
 */

import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { useAffiliateRef } from "@/hooks/useAffiliateRef";
import { AFFILIATES } from "@/lib/affiliates";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/95558444/SRpei9L9RnhAsFaEksuafb/sgc-hero-fpazMZkWBgDV6FeDdaQhg6.webp";

const loanTypes = [
  "Fix & Flip",
  "DSCR Loan",
  "Bridge Loan",
  "New Construction",
  "Ground-Up Construction",
  "Cash-Out Refinance",
];

const trustBadges = [
  "No Upfront Fees",
  "24–48 Hour Approval",
  "Competitive Rates",
  "Direct Lender",
];

export function HeroSection() {
  const affiliateRef = useAffiliateRef();
  const [formData, setFormData] = useState({
    loanType: "",
    loanAmount: "",
    propertyType: "",
    name: "",
    phone: "",
    email: "",
    referredBy: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const body = new URLSearchParams({
        "form-name": "quote",
        ...formData,
        ...(affiliateRef ? { affiliateRef } : {}),
      });
      const res = await fetch("/netlify-forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please call us directly.");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToNext = () => {
    const el = document.querySelector("#loan-programs");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/80 to-[#0A1628]/40" />
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="relative z-10 container w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Text */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-[#E8A020]" />
              <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                Private Hard Money Lending
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="font-display text-white leading-none">
                <span className="block text-5xl md:text-6xl xl:text-7xl">FUND YOUR</span>
                <span className="block text-5xl md:text-6xl xl:text-7xl">NEXT DEAL</span>
                <span className="block text-5xl md:text-6xl xl:text-7xl text-[#E8A020]">
                  FAST.
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-white/75 text-lg leading-relaxed max-w-md font-light">
              Southern Ground Capital delivers flexible, fast-close hard money loans for real estate investors nationwide. No red tape. No delays. Just capital.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-sm px-3 py-1.5"
                >
                  <CheckCircle2 size={13} className="text-[#E8A020] flex-shrink-0" />
                  <span className="text-white/80 text-xs font-medium">{badge}</span>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
              {[
                { value: "$500M+", label: "Loans Funded" },
                { value: "48hr", label: "Avg. Approval" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-mono-nums text-[#E8A020] text-2xl md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-xs mt-1 tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quote Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-[#0F2040]/90 backdrop-blur-sm border border-[#E8A020]/30 rounded-sm p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#E8A020]/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-[#E8A020]" />
                  </div>
                  <h3 className="font-display text-white text-2xl">REQUEST RECEIVED</h3>
                  <p className="text-white/60 text-sm">
                    A Southern Ground Capital loan specialist will contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="sgc-amber-bar mb-1">
                      <h2 className="font-display text-white text-xl">GET A FREE QUOTE</h2>
                    </div>
                    <p className="text-white/50 text-xs mt-2">
                      No obligation. Fast response. Direct lender.
                    </p>
                  </div>

                  <form
                    name="quote"
                    data-netlify="true"
                    netlify-honeypot="bot-field"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <input type="hidden" name="form-name" value="quote" />
                    <input type="hidden" name="bot-field" />
                    {/* Loan Type */}
                    <div>
                      <label className="block text-white/60 text-xs font-mono tracking-wider mb-1.5 uppercase">
                        Loan Type
                      </label>
                      <div className="relative">
                        <select
                          name="loanType"
                          required
                          value={formData.loanType}
                          onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                          className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 appearance-none focus:border-[#E8A020] focus:outline-none transition-colors"
                        >
                          <option value="" disabled>Select loan type...</option>
                          {loanTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8A020] pointer-events-none" />
                      </div>
                    </div>

                    {/* Loan Amount */}
                    <div>
                      <label className="block text-white/60 text-xs font-mono tracking-wider mb-1.5 uppercase">
                        Loan Amount
                      </label>
                      <div className="relative">
                        <select
                          name="loanAmount"
                          required
                          value={formData.loanAmount}
                          onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                          className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 appearance-none focus:border-[#E8A020] focus:outline-none transition-colors"
                        >
                          <option value="" disabled>Select amount range...</option>
                          <option value="under-100k">Under $100,000</option>
                          <option value="100k-250k">$100,000 – $250,000</option>
                          <option value="250k-500k">$250,000 – $500,000</option>
                          <option value="500k-1m">$500,000 – $1,000,000</option>
                          <option value="over-1m">Over $1,000,000</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8A020] pointer-events-none" />
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-white/60 text-xs font-mono tracking-wider mb-1.5 uppercase">
                        Property Type
                      </label>
                      <div className="relative">
                        <select
                          name="propertyType"
                          required
                          value={formData.propertyType}
                          onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                          className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 appearance-none focus:border-[#E8A020] focus:outline-none transition-colors"
                        >
                          <option value="" disabled>Select property type...</option>
                          <option value="sfr">Single Family Residential</option>
                          <option value="multi">Multi-Family (2–4 units)</option>
                          <option value="commercial">Commercial</option>
                          <option value="mixed-use">Mixed Use</option>
                          <option value="land">Land / Lot</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8A020] pointer-events-none" />
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-white/60 text-xs font-mono tracking-wider mb-1.5 uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/30 focus:border-[#E8A020] focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Referred By */}
                    {AFFILIATES.length > 0 && (
                      <div>
                        <label className="block text-white/60 text-xs font-mono tracking-wider mb-1.5 uppercase">
                          Referred By <span className="text-white/30">(Optional)</span>
                        </label>
                        <div className="relative">
                          <select
                            name="referredBy"
                            value={formData.referredBy}
                            onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                            className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 appearance-none focus:border-[#E8A020] focus:outline-none transition-colors"
                          >
                            <option value="">Select affiliate...</option>
                            {AFFILIATES.map((a) => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8A020] pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Phone + Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/60 text-xs font-mono tracking-wider mb-1.5 uppercase">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="(555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/30 focus:border-[#E8A020] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 text-xs font-mono tracking-wider mb-1.5 uppercase">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="you@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/30 focus:border-[#E8A020] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-400 text-xs text-center">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-amber w-full py-3 rounded-sm flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Sending…" : "Get My Free Quote"}
                      {!isLoading && <ArrowRight size={16} />}
                    </button>

                    <p className="text-white/30 text-[10px] text-center">
                      By submitting, you agree to be contacted by a loan specialist. No spam, ever.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-[#E8A020] transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}

export default HeroSection;
