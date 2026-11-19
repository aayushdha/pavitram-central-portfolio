import { notFound } from "next/navigation";
import Link from "next/link";
import { companies, companyReviews, recommendedJobs } from "@/lib/data";
import { MatchRing } from "@/components/ui/MatchRing";
import { CompanyFollowButton } from "./CompanyFollowButton";
import { Star, Users2, MapPin, Calendar } from "lucide-react";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = companies.find((c) => c.id === id);
  if (!company) notFound();

  const reviews = companyReviews.filter((r) => r.companyId === id);
  const jobs = recommendedJobs.filter((j) => company.openJobIds.includes(j.id));

  return (
    <div>
      <div className="rounded-2xl border border-border bg-surface overflow-hidden mb-6">
        <div className="h-28 bg-ink-900" />
        <div className="p-6 -mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-2xl bg-brand-50 text-brand-700 grid place-items-center font-display font-bold text-2xl border-4 border-surface shrink-0">
                {company.logo}
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-ink">{company.name}</h1>
                <p className="text-sm text-muted">{company.industry}</p>
              </div>
            </div>
            <CompanyFollowButton companyId={company.id} followers={company.followers} />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted mt-4">
            <span className="flex items-center gap-1"><Star size={14} className="text-warn-500 fill-warn-500" /> {company.rating} ({company.reviews} reviews)</span>
            <span className="flex items-center gap-1"><Users2 size={14} /> {company.size}</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> {company.hq}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> Founded {company.founded}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display font-semibold text-lg mb-3">About</h2>
            <p className="text-sm text-muted leading-relaxed">{company.about}</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Employee reviews</h2>
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl bg-background p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-ink">{r.title}</p>
                    <span className="flex items-center gap-1 text-xs text-warn-500 font-semibold">
                      <Star size={12} className="fill-warn-500" /> {r.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">{r.body}</p>
                  <p className="text-[11px] text-muted">{r.author} · {r.date}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 h-fit">
          <h2 className="font-display font-semibold text-lg mb-4">Open roles ({jobs.length})</h2>
          <div className="flex flex-col divide-y divide-border">
            {jobs.map((j) => (
              <Link key={j.id} href={`/seeker/jobs/${j.id}`} className="py-3 flex items-center gap-3 hover:opacity-80">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{j.title}</p>
                  <p className="text-xs text-muted truncate">{j.location}</p>
                </div>
                <MatchRing value={j.match} size={32} />
              </Link>
            ))}
            {jobs.length === 0 && <p className="text-sm text-muted py-2">No open roles right now.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
