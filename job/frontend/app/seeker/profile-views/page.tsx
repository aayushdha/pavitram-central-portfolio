import { PageHeader } from "@/components/ui/PageHeader";
import { TrendLine, SplitPie } from "@/components/ui/Charts";
import { profileViewers } from "@/lib/data";
import { Eye, Lock } from "lucide-react";

export default function ProfileViewsPage() {
  return (
    <div>
      <PageHeader title="Profile views" subtitle="See who's been checking out your profile." />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted mb-1">Total views</p>
          <p className="font-display text-2xl font-bold text-ink">{profileViewers.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted mb-1">Last 7 days</p>
          <p className="font-display text-2xl font-bold text-ink">{profileViewers.last7days}</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-1">Views this week</h2>
          <TrendLine data={profileViewers.trend} dataKey="views" color="#C9A227" xKey="day" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display font-semibold text-lg mb-4">Who&apos;s viewing, by industry</h2>
          <SplitPie data={profileViewers.industries} nameKey="name" valueKey="value" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Eye size={18} className="text-brand-600" /> Recent viewers
        </h2>
        <div className="flex flex-col divide-y divide-border">
          {profileViewers.recentViewers.map((v, i) => (
            <div key={i} className="py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                {v.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">{v.name}</p>
                <p className="text-xs text-muted truncate">{v.role}</p>
              </div>
              <span className="text-xs text-muted shrink-0">{v.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-brand-50 text-brand-700 text-sm px-4 py-3 flex items-center gap-2">
          <Lock size={14} /> Upgrade to Premium to see full names and companies for every viewer.
        </div>
      </div>
    </div>
  );
}
