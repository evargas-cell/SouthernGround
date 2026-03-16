/*
 * LoanCalculator — Southern Ground Capital
 * Design: Industrial Precision — light section with dark calculator card
 * Quick loan estimate calculator
 */

import { useState, useMemo } from "react";
import { Calculator, ArrowRight } from "lucide-react";

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(250000);
  const [interestRate, setInterestRate] = useState(11.5);
  const [termMonths, setTermMonths] = useState(12);

  const results = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyInterest = loanAmount * monthlyRate;
    const totalInterest = monthlyInterest * termMonths;
    const originationFee = loanAmount * 0.02; // 2 points
    const totalCost = totalInterest + originationFee;
    return {
      monthlyInterest: Math.round(monthlyInterest),
      totalInterest: Math.round(totalInterest),
      originationFee: Math.round(originationFee),
      totalCost: Math.round(totalCost),
    };
  }, [loanAmount, interestRate, termMonths]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const scrollToContact = () => {
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-[#F0F4F8]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Heading */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#E8A020]" />
              <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                Loan Estimator
              </span>
            </div>
            <h2 className="font-display text-[#0A1628] text-4xl md:text-5xl leading-tight mb-6">
              ESTIMATE YOUR<br />
              <span className="text-[#E8A020]">LOAN COSTS</span>
            </h2>
            <p className="text-[#0A1628]/60 text-sm leading-relaxed mb-8 max-w-md">
              Use our quick calculator to get a rough estimate of your monthly interest payments and total loan cost. For an exact quote tailored to your deal, speak with a specialist.
            </p>
            <div className="space-y-3">
              {[
                "Interest-only payments during loan term",
                "No prepayment penalties on most programs",
                "Points typically 1–3% of loan amount",
                "Rates vary based on LTV, property, and experience",
              ].map((note) => (
                <div key={note} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] mt-1.5 flex-shrink-0" />
                  <span className="text-[#0A1628]/60 text-sm">{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Calculator */}
          <div className="bg-[#0A1628] rounded-sm p-6 md:p-8 border border-[#E8A020]/20 shadow-[0_24px_64px_rgba(10,22,40,0.15)]">
            <div className="flex items-center gap-3 mb-6">
              <Calculator size={20} className="text-[#E8A020]" />
              <h3 className="font-display text-white text-xl">QUICK ESTIMATOR</h3>
            </div>

            <div className="space-y-6">
              {/* Loan Amount */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white/50 text-xs font-mono tracking-wider uppercase">
                    Loan Amount
                  </label>
                  <span className="font-mono-nums text-[#E8A020] text-lg">
                    {formatCurrency(loanAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={25000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-[#E8A020] h-1 rounded-full"
                />
                <div className="flex justify-between text-white/20 text-[10px] font-mono mt-1">
                  <span>$50K</span>
                  <span>$2M</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white/50 text-xs font-mono tracking-wider uppercase">
                    Interest Rate
                  </label>
                  <span className="font-mono-nums text-[#E8A020] text-lg">
                    {interestRate.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={9}
                  max={16}
                  step={0.5}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-[#E8A020] h-1 rounded-full"
                />
                <div className="flex justify-between text-white/20 text-[10px] font-mono mt-1">
                  <span>9%</span>
                  <span>16%</span>
                </div>
              </div>

              {/* Term */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white/50 text-xs font-mono tracking-wider uppercase">
                    Loan Term
                  </label>
                  <span className="font-mono-nums text-[#E8A020] text-lg">
                    {termMonths} mo.
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={24}
                  step={3}
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  className="w-full accent-[#E8A020] h-1 rounded-full"
                />
                <div className="flex justify-between text-white/20 text-[10px] font-mono mt-1">
                  <span>3 mo.</span>
                  <span>24 mo.</span>
                </div>
              </div>

              {/* Results */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                {[
                  { label: "Monthly Interest", value: formatCurrency(results.monthlyInterest) },
                  { label: "Total Interest (term)", value: formatCurrency(results.totalInterest) },
                  { label: "Est. Origination Fee (2 pts)", value: formatCurrency(results.originationFee) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-white/40 text-xs">{row.label}</span>
                    <span className="font-mono text-white text-sm font-medium">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-[#E8A020]/20">
                  <span className="text-white/70 text-sm font-medium">Est. Total Cost</span>
                  <span className="font-mono-nums text-[#E8A020] text-xl">{formatCurrency(results.totalCost)}</span>
                </div>
              </div>

              <p className="text-white/20 text-[10px] leading-relaxed">
                * This is an estimate only. Actual rates, fees, and terms depend on deal specifics, LTV, and borrower profile.
              </p>

              <button
                onClick={scrollToContact}
                className="btn-amber w-full py-3 rounded-sm text-sm flex items-center justify-center gap-2"
              >
                Get an Exact Quote
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
