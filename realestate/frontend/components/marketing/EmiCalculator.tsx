"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { formatINR } from "@/lib/mock-data";

export function EmiCalculator({ initialPrice = 5000000 }: { initialPrice?: number }) {
  const [price, setPrice] = useState(initialPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [rate, setRate] = useState(8.6);
  const [tenureYears, setTenureYears] = useState(20);

  const { emi, principal, totalInterest, totalPayment } = useMemo(() => {
    const downPayment = (price * downPaymentPct) / 100;
    const principal = price - downPayment;
    const monthlyRate = rate / 12 / 100;
    const months = tenureYears * 12;
    const emi =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    return { emi, principal, totalInterest, totalPayment };
  }, [price, downPaymentPct, rate, tenureYears]);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Calculator size={17} />
        </div>
        <div>
          <h3 className="font-display text-lg font-medium text-ink-900">EMI Calculator</h3>
          <p className="text-xs text-text-500">Estimate only — confirm final terms with your lender</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Property price</label>
            <span className="font-mono text-xs text-ink-900">{formatINR(price)}</span>
          </div>
          <input
            type="range"
            min={1000000}
            max={50000000}
            step={100000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Down payment</label>
            <span className="font-mono text-xs text-ink-900">{downPaymentPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Interest rate</label>
            <span className="font-mono text-xs text-ink-900">{rate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={6}
            max={14}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Loan tenure</label>
            <span className="font-mono text-xs text-ink-900">{tenureYears} yrs</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-text-500">Monthly EMI</p>
          <p className="mt-1 font-display text-lg font-medium text-brand-700">
            {formatINR(Math.round(emi))}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-500">Loan amount</p>
          <p className="mt-1 font-display text-lg font-medium text-ink-900">{formatINR(principal)}</p>
        </div>
        <div>
          <p className="text-xs text-text-500">Total interest</p>
          <p className="mt-1 font-display text-lg font-medium text-ink-900">
            {formatINR(Math.round(totalInterest))}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-500">Total payment</p>
          <p className="mt-1 font-display text-lg font-medium text-ink-900">
            {formatINR(Math.round(totalPayment))}
          </p>
        </div>
      </div>
    </div>
  );
}
