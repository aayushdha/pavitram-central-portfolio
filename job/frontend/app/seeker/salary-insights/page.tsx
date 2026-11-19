"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { TrendLine } from "@/components/ui/Charts";
import { salaryInsights } from "@/lib/data";
import { Search, IndianRupee } from "lucide-react";

function fmt(n: number) {
  return `₹${(n / 100000).toFixed(1)}L`;
}

export default function SalaryInsightsPage() {
  const toast = useToast();
  // What's typed in the form vs. what the results below are showing.
  const [role, setRole] = useState(salaryInsights.role);
  const [city, setCity] = useState(salaryInsights.city);
  const [applied, setApplied] = useState({ role: salaryInsights.role, city: salaryInsights.city });

  function search() {
    if (!role.trim()) return toast("Enter a job title to search.", "error");
    setApplied({ role: role.trim(), city });
  }

  // Benchmarks exist for one role; other cities are scaled from their city median.
  const cityMedian = salaryInsights.byCity.find((c) => c.city === applied.city)?.salary ?? salaryInsights.median;
  const ratio = cityMedian / salaryInsights.median;
  const median = cityMedian;
  const min = Math.round(salaryInsights.min * ratio);
  const max = Math.round(salaryInsights.max * ratio);
  const isDefaultRole = applied.role.toLowerCase() === salaryInsights.role.toLowerCase();

  return (
    <div>
      <PageHeader title="Salary insights" subtitle="See what people in your role are paid, by experience and city." />

      <div className="rounded-2xl border border-border bg-surface p-5 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5 flex-1">
          <Search size={16} className="text-muted" />
          <input value={role} onChange={(e) => setRole(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Job title" className="flex-1 outline-none text-sm bg-transparent" />
        </div>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none">
          {salaryInsights.byCity.map((c) => (
            <option key={c.city}>{c.city}</option>
          ))}
        </select>
        <button onClick={search} className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-5 py-2.5 text-sm">
          Search
        </button>
      </div>

      {!isDefaultRole && (
        <p className="text-xs text-muted bg-warn-100 rounded-xl px-4 py-2.5 mb-4">
          Role-specific data for &ldquo;{applied.role}&rdquo; isn&apos;t available yet — showing {salaryInsights.role} benchmarks for {applied.city}.
        </p>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted mb-1">Median salary</p>
          <p className="font-display text-2xl font-bold text-ink flex items-center gap-1"><IndianRupee size={18} />{fmt(median).replace("₹", "")}</p>
          <p className="text-xs text-muted mt-1">{applied.role} in {applied.city}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted mb-1">Typical range</p>
          <p className="font-display text-lg font-bold text-ink">{fmt(min)} – {fmt(max)}</p>
          <p className="text-xs text-muted mt-1">10th to 90th percentile</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted mb-1">Best paying city</p>
          <p className="font-display text-lg font-bold text-ink">{salaryInsights.byCity[0].city}</p>
          <p className="text-xs text-muted mt-1">{fmt(salaryInsights.byCity[0].salary)} median</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">Salary by experience</h2>
          <p className="text-xs text-muted mb-2">Median annual salary, in ₹ lakhs</p>
          <TrendLine
            data={salaryInsights.byExperience.map((e) => ({ years: e.years, salaryL: Math.round((e.salary * ratio) / 100000) }))}
            dataKey="salaryL"
            color="#C9A227"
            xKey="years"
          />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-4">Salary by city</h2>
          <div className="flex flex-col gap-3">
            {salaryInsights.byCity.map((c) => (
              <div key={c.city} className="flex items-center gap-3">
                <span className={`w-28 text-sm shrink-0 ${c.city === applied.city ? "text-brand-700 font-semibold" : "text-ink"}`}>{c.city}</span>
                <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(c.salary / salaryInsights.byCity[0].salary) * 100}%` }} />
                </div>
                <span className="w-16 text-right text-xs text-muted shrink-0">{fmt(c.salary)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
