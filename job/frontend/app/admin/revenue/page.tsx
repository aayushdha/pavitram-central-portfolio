import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { TrendLine, SplitPie } from "@/components/ui/Charts";
import { revenueTrend, revenueSplit } from "@/lib/data";
import { IndianRupee, TrendingUp, Repeat, FileText } from "lucide-react";

function formatINR(n: number) {
  return `₹${(n / 100000).toFixed(1)}L`;
}

export default function RevenuePage() {
  const latest = revenueTrend[revenueTrend.length - 1].mrr;
  const arr = latest * 12;

  return (
    <div>
      <PageHeader title="Revenue & subscriptions" subtitle="Monthly income, plan performance, and billing, all in one view." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="MRR" value={formatINR(latest)} delta={7.6} icon={<IndianRupee size={18} />} />
        <StatCard label="ARR (projected)" value={formatINR(arr)} delta={7.6} icon={<TrendingUp size={18} />} accent="spark" />
        <StatCard label="Net revenue retention" value="112%" delta={3} icon={<Repeat size={18} />} accent="good" />
        <StatCard label="Invoices this month" value="1,842" delta={11} icon={<FileText size={18} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">MRR trend</h2>
          <p className="text-xs text-muted mb-2">Last 6 months</p>
          <TrendLine data={revenueTrend.map((r) => ({ ...r, mrrL: Math.round(r.mrr / 100000) }))} dataKey="mrrL" color="#17A672" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">Revenue split by plan</h2>
          <p className="text-xs text-muted mb-4">Share of total revenue this month</p>
          <SplitPie data={revenueSplit} nameKey="plan" valueKey="value" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 mt-6">
        <h2 className="font-display font-semibold text-lg mb-4">Employer plan configuration</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-border">
                <th className="py-2.5 font-medium">Plan</th>
                <th className="py-2.5 font-medium">Credits / mo</th>
                <th className="py-2.5 font-medium">Resume DB access</th>
                <th className="py-2.5 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { plan: "Starter", credits: "10", db: "—", price: "₹4,999/mo" },
                { plan: "Growth", credits: "40", db: "Limited", price: "₹14,999/mo" },
                { plan: "Scale", credits: "120", db: "Full access", price: "₹34,999/mo" },
                { plan: "Enterprise", credits: "Unlimited", db: "Full + API", price: "Custom" },
              ].map((p) => (
                <tr key={p.plan}>
                  <td className="py-3 font-medium text-ink">{p.plan}</td>
                  <td className="py-3 text-muted">{p.credits}</td>
                  <td className="py-3 text-muted">{p.db}</td>
                  <td className="py-3 text-muted">{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
