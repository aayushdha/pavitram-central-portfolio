import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, stageTone } from "@/components/ui/Badge";
import { FunnelChart } from "@/components/ui/Charts";
import { employerCompany, employerJobs, candidates, funnelData } from "@/lib/data";
import { Briefcase, Users, Wallet, BadgeCheck, Plus, ArrowRight } from "lucide-react";

export default function EmployerDashboardPage() {
  const liveJobs = employerJobs.filter((j) => j.status === "Live").length;
  const totalApplicants = employerJobs.reduce((s, j) => s + j.applicants, 0);
  const recentCandidates = [...candidates].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Hiring overview"
        subtitle={`${employerCompany.name} · ${employerCompany.plan}`}
        actions={
          <Link
            href="/employer/jobs"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 text-ink-900 px-4 py-2.5 text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} /> Post a job
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Live job postings" value={String(liveJobs)} delta={8} icon={<Briefcase size={18} />} />
        <StatCard label="Total applicants" value={totalApplicants.toLocaleString("en-IN")} delta={15} icon={<Users size={18} />} accent="spark" />
        <StatCard label="Time to hire (avg)" value="22 days" delta={-8} deltaLabel="faster than last month" icon={<BadgeCheck size={18} />} accent="good" />
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted font-medium">Credit wallet</span>
            <Wallet size={18} className="text-brand-600" />
          </div>
          <p className="font-display text-2xl font-bold text-ink">
            {employerCompany.credits} <span className="text-sm text-muted font-normal">/ {employerCompany.creditsTotal} credits</span>
          </p>
          <div className="h-1.5 rounded-full bg-border mt-3 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${(employerCompany.credits / employerCompany.creditsTotal) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-lg">Recruitment funnel</h2>
            <Link href="/employer/analytics" className="text-sm font-semibold text-brand-600 flex items-center gap-1">
              Full analytics <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-xs text-muted mb-2">Across all live postings, last 30 days</p>
          <FunnelChart data={funnelData} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">Top-ranked candidates</h2>
          <p className="text-xs text-muted mb-4">AI match score across your open roles</p>
          <div className="flex flex-col divide-y divide-border">
            {recentCandidates.map((c) => (
              <div key={c.id} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{c.name}</p>
                  <p className="text-xs text-muted truncate">{c.appliedFor}</p>
                </div>
                <Badge tone={stageTone(c.stage)}>{c.stage}</Badge>
              </div>
            ))}
          </div>
          <Link href="/employer/candidates" className="text-sm font-semibold text-brand-600 mt-3 inline-flex items-center gap-1">
            Open ATS board <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Your job postings</h2>
          <Link href="/employer/jobs" className="text-sm font-semibold text-brand-600 flex items-center gap-1">
            Manage all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-border">
                <th className="py-2.5 font-medium">Role</th>
                <th className="py-2.5 font-medium">Location</th>
                <th className="py-2.5 font-medium">Applicants</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employerJobs.slice(0, 4).map((j) => (
                <tr key={j.id}>
                  <td className="py-3 font-medium text-ink">{j.title}</td>
                  <td className="py-3 text-muted">{j.location}</td>
                  <td className="py-3 text-muted">{j.applicants}</td>
                  <td className="py-3"><Badge tone={stageTone(j.status)}>{j.status}</Badge></td>
                  <td className="py-3 text-muted">{j.expiresIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
