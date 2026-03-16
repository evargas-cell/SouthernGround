'use client';

/*
 * ContactSection — Southern Ground Capital
 * Design: Industrial Precision — dark section with detailed contact form
 * Full contact form + contact info sidebar
 */

import { useState } from "react";
import { Phone, Mail, MapPin, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";

const loanTypes = [
  "Fix & Flip",
  "DSCR Loan",
  "Bridge Loan",
  "New Construction",
  "Multi-Family",
  "Cash-Out Refinance",
  "Other",
];

// All US states + DC, excluding: Arizona, Nevada, North Dakota, Oregon, South Dakota, Utah, Vermont
const states = [
  "Alabama", "Alaska", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana",
  "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
  "Ohio", "Oklahoma", "Pennsylvania", "Rhode Island", "South Carolina",
  "Tennessee", "Texas", "Virginia", "Washington", "Washington D.C.",
  "West Virginia", "Wisconsin", "Wyoming", "Other",
];

export function ContactSection({ defaultLoanType = "" }: { defaultLoanType?: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    loanType: defaultLoanType,
    loanAmount: "",
    propertyState: "",
    message: "",
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
        "form-name": "contact",
        formType: "contact",
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
    <section id="contact" className="py-24 bg-[#0A1628]">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-[#E8A020]" />
                <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                  Get In Touch
                </span>
              </div>
              <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mb-4">
                READY TO FUND<br />
                <span className="text-[#E8A020]">YOUR NEXT DEAL?</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Submit your information and a Southern Ground Capital loan specialist will reach out within 24 hours to discuss your deal and provide a no-obligation quote.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/20 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-[#E8A020]" />
                </div>
                <div>
                  <div className="text-white/40 text-xs font-mono tracking-wider uppercase mb-1">Phone</div>
                  <a href="tel:+16788428084" className="text-white hover:text-[#E8A020] transition-colors font-medium">
                    (678) 842-8084
                  </a>
                  <div className="text-white/30 text-xs mt-0.5">Mon–Fri, 8am–6pm EST</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-[#E8A020]" />
                </div>
                <div>
                  <div className="text-white/40 text-xs font-mono tracking-wider uppercase mb-1">Email</div>
                  <a href="mailto:loans@sgcapital.io" className="text-white hover:text-[#E8A020] transition-colors font-medium">
                    loans@sgcapital.io
                  </a>
                  <div className="text-white/30 text-xs mt-0.5">We respond within 24 hours</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-[#E8A020]" />
                </div>
                <div>
                  <div className="text-white/40 text-xs font-mono tracking-wider uppercase mb-1">Service Area</div>
                  <div className="text-white font-medium">Nationwide</div>
                  <div className="text-white/30 text-xs mt-0.5">All states except AZ, NV, ND, OR, SD, UT, VT</div>
                </div>
              </div>
            </div>

            {/* Guarantee badges */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              {[
                "No obligation quote",
                "No upfront fees",
                "No credit pull to get started",
                "Response within 24 hours",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#E8A020] flex-shrink-0" />
                  <span className="text-white/60 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <div className="bg-[#0F2040] border border-[#E8A020]/20 rounded-sm p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#E8A020]/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-[#E8A020]" />
                  </div>
                  <h3 className="font-display text-white text-3xl">MESSAGE RECEIVED</h3>
                  <p className="text-white/60 text-sm max-w-sm mx-auto">
                    Thank you for reaching out. A Southern Ground Capital loan specialist will contact you within 24 hours to discuss your deal.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-outline-amber px-6 py-2.5 rounded-sm text-sm mt-4"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form
                  name="contact"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <input type="hidden" name="form-name" value="contact" />
                  <input type="hidden" name="bot-field" />
                  <div className="sgc-amber-bar mb-6">
                    <h3 className="font-display text-white text-xl">LOAN REQUEST FORM</h3>
                    <p className="text-white/40 text-xs mt-1">All fields required</p>
                  </div>

                  {/* Name + Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
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
                  </div>

                  {/* Email */}
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

                  {/* Loan Type + Amount */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
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
                          <option value="" disabled>Select type...</option>
                          {loanTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8A020] pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
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
                          <option value="" disabled>Select amount...</option>
                          <option value="under-100k">Under $100K</option>
                          <option value="100k-250k">$100K – $250K</option>
                          <option value="250k-500k">$250K – $500K</option>
                          <option value="500k-1m">$500K – $1M</option>
                          <option value="over-1m">Over $1M</option>
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8A020] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                      Property State
                    </label>
                    <div className="relative">
                      <select
                        name="propertyState"
                        required
                        value={formData.propertyState}
                        onChange={(e) => setFormData({ ...formData, propertyState: e.target.value })}
                        className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 appearance-none focus:border-[#E8A020] focus:outline-none transition-colors"
                      >
                        <option value="" disabled>Select state...</option>
                        {states.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8A020] pointer-events-none" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                      Tell Us About Your Deal
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Property address, purchase price, renovation budget, timeline, or any other details..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/20 focus:border-[#E8A020] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-amber w-full py-3.5 rounded-sm text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending…" : "Submit Loan Request"}
                    {!isLoading && <ArrowRight size={16} />}
                  </button>

                  <p className="text-white/25 text-[10px] text-center">
                    Your information is secure and will never be sold or shared with third parties.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
