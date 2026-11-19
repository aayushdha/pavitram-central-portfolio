"use client";

import { useState } from "react";
import { CheckSquare, Square, FileText } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { seekerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmiCalculator } from "@/components/marketing/EmiCalculator";
import { formatINR } from "@/lib/mock-data";

const legalChecklist = [
  "Title deed & chain of ownership documents",
  "Encumbrance certificate (13-year search)",
  "RERA registration number (for under-construction)",
  "Occupancy / completion certificate",
  "Property tax receipts, up to date",
  "No-objection certificates (society / builder)",
];

function LoanEligibility() {
  const [income, setIncome] = useState(120000);
  const [existingEmi, setExistingEmi] = useState(15000);
  const eligibleEmi = Math.max(0, income * 0.5 - existingEmi);
  const eligibleLoan = Math.round((eligibleEmi * 12 * 20) / 1.55); // rough approximation

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Monthly household income</label>
            <span className="font-mono text-xs text-ink-900">{formatINR(income)}</span>
          </div>
          <input type="range" min={30000} max={500000} step={5000} value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Existing EMI obligations</label>
            <span className="font-mono text-xs text-ink-900">{formatINR(existingEmi)}</span>
          </div>
          <input type="range" min={0} max={100000} step={1000} value={existingEmi} onChange={(e) => setExistingEmi(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4">
        <div>
          <p className="text-xs text-text-500">Eligible monthly EMI</p>
          <p className="mt-1 font-display text-lg font-medium text-brand-700">{formatINR(Math.round(eligibleEmi))}</p>
        </div>
        <div>
          <p className="text-xs text-text-500">Estimated loan eligibility</p>
          <p className="mt-1 font-display text-lg font-medium text-ink-900">{formatINR(eligibleLoan)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-text-400">
        Based on standard bank rules — the real amount depends on your bank and credit score.
      </p>
      <Button variant="outline" size="sm" className="mt-4">Compare lender offers</Button>
    </div>
  );
}

function ValuationTool() {
  const [area, setArea] = useState(1200);
  const [pricePerSqft, setPricePerSqft] = useState(7200);
  const estimate = area * pricePerSqft;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Carpet area (sqft)</label>
            <span className="font-mono text-xs text-ink-900">{area}</span>
          </div>
          <input type="range" min={300} max={5000} step={50} value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="text-text-600">Locality avg. price / sqft</label>
            <span className="font-mono text-xs text-ink-900">₹{pricePerSqft.toLocaleString("en-IN")}</span>
          </div>
          <input type="range" min={2000} max={45000} step={100} value={pricePerSqft} onChange={(e) => setPricePerSqft(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
      </div>
      <div className="mt-6 rounded-xl bg-brand-50/60 p-4">
        <p className="text-xs text-brand-700">Estimated fair-market value</p>
        <p className="mt-1 font-display text-2xl font-medium text-brand-800">{formatINR(estimate)}</p>
      </div>
      <p className="mt-3 text-xs text-text-400">
        Estimate derived from comparable listings and locality price trends — not a certified valuation.
      </p>
    </div>
  );
}

function LegalChecklist() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <ul className="space-y-2">
        {legalChecklist.map((item, i) => (
          <li key={item}>
            <button
              onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
              className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left hover:bg-stone-50"
            >
              {checked[i] ? (
                <CheckSquare size={17} className="shrink-0 text-brand-600" />
              ) : (
                <Square size={17} className="shrink-0 text-text-400" />
              )}
              <span className={`text-sm ${checked[i] ? "text-text-400 line-through" : "text-text-700"}`}>{item}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-50 p-4">
        <p className="flex items-center gap-2 text-sm text-text-600">
          <FileText size={15} /> Want a lawyer to review these for you?
        </p>
        <Button href="/services" variant="outline" size="sm">Chat with a lawyer</Button>
      </div>
    </div>
  );
}

export default function SeekerToolsPage() {
  return (
    <DashboardShell
      groups={seekerNav}
      roleLabel="Property Seeker"
      pageTitle="Money & legal tools"
      pageSubtitle="Check the numbers before you decide"
      userName="Ananya Sharma"
      userMeta="Property Seeker"
      avatarInitials="AS"
    >
      <Card padded={false}>
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <CardHeader title="Plan the numbers, then the paperwork" />
          <Tabs
            tabs={[
              { label: "EMI Calculator", content: <div className="pb-6"><EmiCalculator /></div> },
              { label: "Loan Eligibility", content: <div className="pb-6"><LoanEligibility /></div> },
              { label: "Property Valuation", content: <div className="pb-6"><ValuationTool /></div> },
              { label: "Legal Checklist", content: <div className="pb-6"><LegalChecklist /></div> },
            ]}
          />
        </div>
      </Card>
    </DashboardShell>
  );
}
