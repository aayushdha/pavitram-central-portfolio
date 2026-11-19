import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { MultiTrendLine } from "@/components/ui/Charts";
import { platformMetrics, growthTrend, moderationQueue, supportTickets } from "@/lib/data";
import { Users, Building2, Briefcase, Target, ArrowRight, ShieldAlert } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader title="Platform overview" subtitle="A live look at job seekers, employers, and content." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active job seekers"
          value={platformMetrics.activeSeekers.toLocaleString("en-IN")}
          delta={platformMetrics.seekerGrowth}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Active employers"
          value={platformMetrics.activeEmployers.toLocaleString("en-IN")}
          delta={platformMetrics.employerGrowth}
          icon={<Building2 size={18} />}
          accent="spark"
        />
        <StatCard
          label="Live job postings"
          value={platformMetrics.liveJobs.toLocaleString("en-IN")}
          delta={platformMetrics.jobsGrowth}
          icon={<Briefcase size={18} />}
        />
        <StatCard
          label="Match success rate"
          value={`${platformMetrics.matchSuccessRate}%`}
          delta={2.1}
          icon={<Target size={18} />}
          accent="good"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">Platform growth</h2>
          <p className="text-xs text-muted mb-2">Active seekers vs. active employers, last 6 months</p>
          <MultiTrendLine
            data={growthTrend}
            lines={[
              { key: "seekers", color: "#4F3FF0", name: "Job seekers" },
              { key: "employers", color: "#FF7A1A", name: "Employers" },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <ShieldAlert size={18} className="text-bad-500" /> Moderation queue
            </h2>
          </div>
          <p className="text-xs text-muted mb-4">{moderationQueue.length} postings flagged for review</p>
          <div className="flex flex-col gap-3">
            {moderationQueue.slice(0, 4).map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-background">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink line-clamp-1">{m.title}</p>
                  <Badge tone={m.risk === "High" ? "bad" : m.risk === "Medium" ? "warn" : "neutral"}>{m.risk}</Badge>
                </div>
                <p className="text-xs text-muted mt-1">{m.company} · {m.flag}</p>
              </div>
            ))}
          </div>
          <Link href="/admin/moderation" className="text-sm font-semibold text-brand-600 mt-3 inline-flex items-center gap-1">
            Review all <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div id="support" className="rounded-2xl border border-border bg-surface p-5 mt-6">
        <h2 className="font-display font-semibold text-lg mb-4">Support escalations</h2>
        <div className="flex flex-col divide-y divide-border">
          {supportTickets.map((t) => (
            <div key={t.id} className="py-3 flex items-center gap-4">
              <Badge tone={t.priority === "High" ? "bad" : t.priority === "Medium" ? "warn" : "neutral"}>{t.priority}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{t.subject}</p>
                <p className="text-xs text-muted">{t.from}</p>
              </div>
              <span className="text-xs text-muted shrink-0">SLA: {t.sla}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
