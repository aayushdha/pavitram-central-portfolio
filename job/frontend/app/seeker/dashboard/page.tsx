"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { MatchRing } from "@/components/ui/MatchRing";
import { Badge } from "@/components/ui/Badge";
import {
  seekerProfile,
  recommendedJobs,
  seekerApplications,
} from "@/lib/data";
import {
  ClipboardList,
  Eye,
  CalendarClock,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function SeekerDashboardPage() {
  const { user } = useAuth();
  const firstName = (user?.name || seekerProfile.name).trim().split(/\s+/)[0];
  const upcoming = seekerApplications.filter((a) => a.stage === "Interview");

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's how your job search is tracking this week."
        actions={
          <Link
            href="/seeker/jobs"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 text-ink-900 px-4 py-2.5 text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            <Sparkles size={16} /> Find matching jobs
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active applications" value="6" delta={20} icon={<ClipboardList size={18} />} />
        <StatCard label="Profile views (30d)" value="214" delta={14} icon={<Eye size={18} />} accent="spark" />
        <StatCard label="Interviews scheduled" value={String(upcoming.length)} delta={9} icon={<CalendarClock size={18} />} accent="good" />
        <div className="rounded-2xl border border-border bg-surface p-5 flex items-center gap-4">
          <MatchRing value={seekerProfile.profileStrength} label="strength" size={64} />
          <div>
            <p className="text-sm font-medium text-ink">Profile strength</p>
            <p className="text-xs text-muted mt-1">Add 2 more work samples to reach 90%.</p>
            <Link href="/seeker/profile" className="text-xs font-semibold text-brand-600 mt-1 inline-block">
              Improve profile →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Jobs matching your profile</h2>
              <p className="text-xs text-muted">Ranked by AI fit score using your skills and activity</p>
            </div>
            <Link href="/seeker/jobs" className="text-sm font-semibold text-brand-600 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {recommendedJobs.slice(0, 4).map((job) => (
              <div key={job.id} className="py-4 flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-display font-bold text-sm shrink-0">
                  {job.logo}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/seeker/jobs/${job.id}`} className="font-medium text-ink truncate hover:text-brand-600 block">{job.title}</Link>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    {job.company} <span className="mx-1">·</span> <MapPin size={12} /> {job.location}
                  </p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {job.skills.map((s) => (
                      <Badge key={s} tone="neutral">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <span className="text-sm font-semibold text-ink">{job.salary}</span>
                  <MatchRing value={job.match} size={40} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Upcoming interviews</h2>
            {upcoming.length === 0 && (
              <p className="text-sm text-muted">No interviews scheduled right now.</p>
            )}
            <div className="flex flex-col gap-3">
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-background">
                  <div className="h-9 w-9 rounded-lg bg-brand-500/10 text-brand-600 grid place-items-center shrink-0">
                    <CalendarClock size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{a.job}</p>
                    <p className="text-xs text-muted">{a.company} · updated {a.updated}</p>
                  </div>
                </div>
              ))}
              {seekerApplications.filter((a) => a.stage === "Offer").map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-good-100">
                  <div className="h-9 w-9 rounded-lg bg-good-500/10 text-good-500 grid place-items-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">Offer received — {a.job}</p>
                    <p className="text-xs text-muted">{a.company} · respond by 26 Aug</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-600 to-brand-700 text-white p-5">
            <h2 className="font-display font-semibold text-lg mb-1">Go Premium</h2>
            <p className="text-sm text-brand-100 mb-4">
              See who viewed your profile, boost visibility to recruiters, and unlock salary insights.
            </p>
            <Link href="/seeker/premium" className="block text-center rounded-xl bg-white text-brand-700 text-sm font-semibold px-4 py-2.5 w-full">
              Upgrade — ₹499/mo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
