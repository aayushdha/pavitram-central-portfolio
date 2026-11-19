import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FunnelChart, TrendLine, SplitPie } from "@/components/ui/Charts";
import { funnelData, timeToHireTrend, sourceOfHire } from "@/lib/data";
import { Clock, IndianRupee, TrendingUp } from "lucide-react";

export default function EmployerAnalyticsPage() {
  return (
    <div>
      <PageHeader title="Hiring analytics" subtitle="See how your hiring is going and where your best hires come from." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Avg. time to hire" value="22 days" delta={-8} deltaLabel="faster vs last month" icon={<Clock size={18} />} />
        <StatCard label="Cost per hire" value="₹18,400" delta={-4} icon={<IndianRupee size={18} />} accent="spark" />
        <StatCard label="Interview → offer rate" value="31.6%" delta={6} icon={<TrendingUp size={18} />} accent="good" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">Recruitment funnel</h2>
          <p className="text-xs text-muted mb-2">Applications through to hire, last 30 days</p>
          <FunnelChart data={funnelData} />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">Time-to-hire trend</h2>
          <p className="text-xs text-muted mb-2">Days from posting to accepted offer</p>
          <TrendLine data={timeToHireTrend} dataKey="days" color="#4F3FF0" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">Source of hire</h2>
          <p className="text-xs text-muted mb-4">Which channel produced the eventual hire</p>
          <SplitPie data={sourceOfHire} nameKey="source" valueKey="value" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-4">Drop-off by stage</h2>
          <div className="flex flex-col gap-3">
            {funnelData.map((f, i) => {
              const prev = i === 0 ? f.value : funnelData[i - 1].value;
              const dropOff = i === 0 ? 0 : Math.round(((prev - f.value) / prev) * 100);
              return (
                <div key={f.stage} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-ink shrink-0">{f.stage}</span>
                  <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${(f.value / funnelData[0].value) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-xs text-muted shrink-0">
                    {i === 0 ? "—" : `-${dropOff}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
