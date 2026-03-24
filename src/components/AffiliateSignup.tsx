'use client';

/*
 * AffiliateSignup — Southern Ground Capital
 * Sign-up form for prospective affiliates
 */

import { useState } from "react";
import { ArrowRight, CheckCircle2, DollarSign, Users, Zap } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Referral Commissions",
    description: "Get paid on every deal your clients close with Southern Ground Capital.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "A dedicated account manager to help you and your clients every step of the way.",
  },
  {
    icon: Zap,
    title: "Fast Closings",
    description: "We close in days, not weeks — making you look great to your clients.",
  },
];

export function AffiliateSignup() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const body = new URLSearchParams({
        "form-name": "affiliate",
        formType: "affiliate",
        ...formData,
      });
      const res = await fetch("/netlify-forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-[#0A1628]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: Benefits */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#E8A020]" />
              <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                Affiliate Program
              </span>
            </div>
            <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mb-6">
              GROW TOGETHER.<br />
              <span className="text-[#E8A020]">GET REWARDED.</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-md">
              Partner with Southern Ground Capital and earn commissions by referring real estate investors to our loan programs. No experience required — just connect us with the right people.
            </p>

            <div className="space-y-6">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={18} className="text-[#E8A020]" />
                    </div>
                    <div>
                      <h4 className="font-display text-white text-base mb-1">{item.title}</h4>
                      <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-[#0F2040] border border-[#E8A020]/20 rounded-sm p-6 md:p-10">
            {submitted ? (
              <div className="text-center py-12 space-y-5">
                <div className="w-20 h-20 rounded-full bg-[#E8A020]/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} className="text-[#E8A020]" />
                </div>
                <h3 className="font-display text-white text-3xl">WELCOME TO THE TEAM!</h3>
                <p className="text-white/60 text-sm max-w-sm mx-auto leading-relaxed">
                  Congratulations on joining the Southern Ground Capital affiliate program! We&apos;re excited to have you on board. A member of our team will reach out shortly to chat more about the opportunities ahead.
                </p>
              </div>
            ) : (
              <>
                <div className="sgc-amber-bar mb-8">
                  <h3 className="font-display text-white text-xl">BECOME AN AFFILIATE</h3>
                  <p className="text-white/40 text-xs mt-1">Fill out the form and we&apos;ll be in touch</p>
                </div>

                <form
                  name="affiliate"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <input type="hidden" name="form-name" value="affiliate" />
                  <input type="hidden" name="bot-field" />

                  <div>
                    <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/20 focus:border-[#E8A020] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/20 focus:border-[#E8A020] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/20 focus:border-[#E8A020] focus:outline-none transition-colors"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-amber w-full py-3.5 rounded-sm text-sm inline-flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? "Submitting..." : (
                      <>Join the Affiliate Program <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AffiliateSignup;
