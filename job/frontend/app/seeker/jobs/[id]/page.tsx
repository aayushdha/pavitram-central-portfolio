import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, similarJobs } from "@/lib/data";
import { Badge } from "@/components/ui/Badge";
import { MatchRing } from "@/components/ui/MatchRing";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Eye,
  Clock,
  CheckCircle2,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { JobApplyButton } from "./JobApplyButton";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) notFound();

  const similar = similarJobs(id);

  return (
    <div>
      <Link href="/seeker/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink mb-4">
        <ArrowLeft size={15} /> Back to search
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-display font-bold text-lg shrink-0">
                  {job.logo}
                </div>
                <div>
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">{job.title}</h1>
                  <p className="text-muted mt-0.5">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mt-2">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} /> {job.experience}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Posted {job.posted}</span>
                  </div>
                </div>
              </div>
              <MatchRing value={job.match} size={64} label="match" />
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {job.skills.map((s) => (
                <Badge key={s} tone="neutral">{s}</Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border text-sm">
              <div>
                <p className="text-xs text-muted">Salary</p>
                <p className="font-semibold text-ink">{job.salary}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Openings</p>
                <p className="font-semibold text-ink">{job.openings}</p>
              </div>
              <div>
                <p className="text-xs text-muted flex items-center gap-1"><Users size={11} /> Applicants</p>
                <p className="font-semibold text-ink">{job.applicants}</p>
              </div>
              <div>
                <p className="text-xs text-muted flex items-center gap-1"><Eye size={11} /> Views</p>
                <p className="font-semibold text-ink">{job.views}</p>
              </div>
            </div>

            <div className="mt-5">
              <JobApplyButton job={job} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
            <h2 className="font-display font-semibold text-lg mb-3">Job description</h2>
            <p className="text-sm text-muted leading-relaxed">{job.description}</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
            <h2 className="font-display font-semibold text-lg mb-3">What you&apos;ll do</h2>
            <ul className="flex flex-col gap-2.5">
              {job.responsibilities.map((r) => (
                <li key={r} className="text-sm text-muted flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-brand-500 mt-0.5 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
            <h2 className="font-display font-semibold text-lg mb-3">What we&apos;re looking for</h2>
            <ul className="flex flex-col gap-2.5">
              {job.requirements.map((r) => (
                <li key={r} className="text-sm text-muted flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-good-500 mt-0.5 shrink-0" /> {r}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 mt-4 text-sm text-muted">
              <GraduationCap size={15} className="text-brand-500" /> {job.education}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display font-semibold text-lg mb-3">Perks & benefits</h2>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((b) => (
                <Badge key={b} tone="brand">{b}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-display font-bold shrink-0">
                {job.logo}
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">{job.company}</p>
                <p className="text-xs text-muted flex items-center gap-1"><Building2 size={11} /> {job.location.split("·")[0].trim()}</p>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed">{job.aboutCompany}</p>
            <Link href="/seeker/companies" className="text-sm font-semibold text-brand-600 mt-3 inline-block">
              View company profile →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display font-semibold mb-4">Similar jobs</h2>
            <div className="flex flex-col divide-y divide-border">
              {similar.map((s) => (
                <Link key={s.id} href={`/seeker/jobs/${s.id}`} className="py-3 flex items-center gap-3 hover:opacity-80">
                  <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                    {s.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{s.title}</p>
                    <p className="text-xs text-muted truncate">{s.company}</p>
                  </div>
                  <MatchRing value={s.match} size={32} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
