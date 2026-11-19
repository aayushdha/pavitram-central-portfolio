"use client";

import { useState } from "react";
import { Star, ArrowRight, ShieldCheck, Percent, Clock, IndianRupee } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { EmiCalculator } from "@/components/marketing/EmiCalculator";
import { Button } from "@/components/ui/Button";
import { loanOffers, formatINR } from "@/lib/mock-data";

function LoanEligibility() {
  const [income, setIncome] = useState(120000);
  const [existingEmi, setExistingEmi] = useState(15000);
  const eligibleEmi = Math.max(0, income * 0.5 - existingEmi);
  const eligibleLoan = Math.round((eligibleEmi * 12 * 20) / 1.55);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h3 className="font-display text-lg font-medium text-ink-900">Check how much you can borrow</h3>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Monthly household income</label>
            <span className="font-mono text-xs text-ink-900">{formatINR(income)}</span>
          </div>
          <input type="range" min={30000} max={500000} step={5000} value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full accent-brass-500" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Other loan EMIs you're paying</label>
            <span className="font-mono text-xs text-ink-900">{formatINR(existingEmi)}</span>
          </div>
          <input type="range" min={0} max={100000} step={1000} value={existingEmi} onChange={(e) => setExistingEmi(Number(e.target.value))} className="w-full accent-brass-500" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4">
        <div>
          <p className="text-xs text-text-500">EMI you can afford</p>
          <p className="mt-1 font-display text-lg font-medium text-ink-900">{formatINR(Math.round(eligibleEmi))}/mo</p>
        </div>
        <div>
          <p className="text-xs text-text-500">Loan amount you may get</p>
          <p className="mt-1 font-display text-lg font-medium text-ink-900">{formatINR(eligibleLoan)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-text-400">
        This is a rough estimate — the real amount depends on your bank and credit score.
      </p>
    </div>
  );
}

export default function HomeLoansPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-wider text-brass-600">Home loans</p>
            <h1 className="mt-1 font-display text-3xl font-medium text-ink-900">
              Compare home loans, in one place
            </h1>
            <p className="mt-3 max-w-2xl text-text-600">
              See rates from multiple lenders side by side, work out your EMI, and check how
              much you're likely to be approved for — before you talk to a bank.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-50 text-brass-600">
                <Percent size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Rates from 8.35%</p>
                <p className="text-xs text-text-500">Across partner lenders</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-50 text-brass-600">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Approval in 48 hours</p>
                <p className="text-xs text-text-500">For most salaried applicants</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-50 text-brass-600">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">No hidden charges</p>
                <p className="text-xs text-text-500">Every fee shown upfront</p>
              </div>
            </div>
          </div>

          {/* Lender comparison */}
          <div className="mt-10">
            <h2 className="mb-5 font-display text-xl font-medium text-ink-900">Compare lenders</h2>
            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase text-text-500">
                    <th className="px-4 py-3">Lender</th>
                    <th className="px-4 py-3">Interest rate</th>
                    <th className="px-4 py-3">Processing fee</th>
                    <th className="px-4 py-3">Max tenure</th>
                    <th className="px-4 py-3">Min. loan</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loanOffers.map((l) => (
                    <tr key={l.lender} className="border-b border-stone-100 last:border-0">
                      <td className="px-4 py-3.5 font-medium text-ink-900">{l.lender}</td>
                      <td className="px-4 py-3.5 text-text-700">{l.rate}% onwards</td>
                      <td className="px-4 py-3.5 text-text-700">{l.processingFee}</td>
                      <td className="px-4 py-3.5 text-text-700">{l.maxTenure} yrs</td>
                      <td className="px-4 py-3.5 text-text-700">{l.minAmount}</td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-brass-600">
                          <Star size={12} className="fill-brass-500 text-brass-500" /> {l.rating}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button variant="outline" size="sm">Apply</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculators */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 font-display text-xl font-medium text-ink-900">Work out your EMI</h2>
              <EmiCalculator />
            </div>
            <div>
              <h2 className="mb-4 font-display text-xl font-medium text-ink-900">Check your eligibility</h2>
              <LoanEligibility />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-brass-200 bg-brass-50/60 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-medium text-ink-900">Want a loan advisor to call you?</h2>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text-600">
                <IndianRupee size={13} /> Free consultation — no obligation to proceed
              </p>
            </div>
            <Button href="/services" variant="secondary" size="md" icon={<ArrowRight size={16} />}>
              Talk to an advisor
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
