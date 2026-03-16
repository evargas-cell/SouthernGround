/*
 * Testimonials — Southern Ground Capital
 * Design: Industrial Precision — light section with dark quote cards
 * Borrower testimonials with star ratings
 */

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    location: "Atlanta, GA",
    role: "Fix & Flip Investor",
    rating: 5,
    text: "Southern Ground Capital funded my fix and flip in 6 days. I had another lender fall through at the last minute, and SGC stepped in and saved the deal. Their team was responsive, professional, and delivered exactly what they promised. I've done 4 deals with them since.",
    deals: "12 deals closed",
  },
  {
    name: "Jennifer R.",
    location: "Charlotte, NC",
    role: "DSCR Rental Investor",
    rating: 5,
    text: "As a rental portfolio investor, the DSCR loan program was exactly what I needed. No W-2s, no tax returns — just the property's cash flow. SGC made it simple and closed in under 3 weeks. I've already refinanced two more properties through them.",
    deals: "5 DSCR loans",
  },
  {
    name: "David K.",
    location: "Nashville, TN",
    role: "New Construction Developer",
    rating: 5,
    text: "I've worked with a lot of hard money lenders over the years. Southern Ground Capital is different — they actually understand construction draws and timelines. The draw process was smooth, communication was excellent, and they funded every draw on schedule.",
    deals: "3 construction projects",
  },
  {
    name: "Angela M.",
    location: "Birmingham, AL",
    role: "Real Estate Investor",
    rating: 5,
    text: "I was skeptical at first, but SGC exceeded every expectation. The quote process was fast, the terms were competitive, and my loan specialist kept me informed every step of the way. This is how lending should work.",
    deals: "7 deals closed",
  },
  {
    name: "Robert H.",
    location: "Jacksonville, FL",
    role: "Bridge Loan Borrower",
    rating: 5,
    text: "Needed a bridge loan to close on a commercial property while my permanent financing was being arranged. SGC had me funded in 8 days. The rate was fair, the process was transparent, and there were zero surprises at closing.",
    deals: "2 bridge loans",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const visible = [
    testimonials[current],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#F0F4F8]">
      <div className="container">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
              Borrower Stories
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="font-display text-[#0A1628] text-4xl md:text-5xl leading-tight">
              WHAT OUR BORROWERS<br />
              <span className="text-[#E8A020]">ARE SAYING</span>
            </h2>
            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-sm border-2 border-[#0A1628]/20 flex items-center justify-center hover:border-[#E8A020] hover:text-[#E8A020] transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-mono text-[#0A1628]/40 text-sm">
                {current + 1} / {testimonials.length}
              </span>
              <button
                onClick={next}
                className="w-10 h-10 rounded-sm border-2 border-[#0A1628]/20 flex items-center justify-center hover:border-[#E8A020] hover:text-[#E8A020] transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {visible.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className={`bg-[#0A1628] rounded-sm p-6 transition-all duration-300 ${
                i === 0 ? "border border-[#E8A020]/40 shadow-[0_8px_32px_rgba(232,160,32,0.1)]" : "border border-white/5 opacity-80"
              }`}
            >
              {/* Quote Icon */}
              <Quote size={24} className="text-[#E8A020]/30 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="text-[#E8A020] fill-[#E8A020]" />
                ))}
              </div>

              {/* Text */}
              <p className="text-white/70 text-sm leading-relaxed mb-6 italic">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <div className="font-display text-white text-base leading-tight">{t.name}</div>
                  <div className="text-white/40 text-xs mt-0.5">{t.location}</div>
                  <div className="text-[#E8A020] text-xs font-mono mt-0.5">{t.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/30 text-[10px] font-mono tracking-wider">{t.deals}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-[#E8A020] w-6" : "bg-[#0A1628]/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
