"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal, inputCls, labelCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useSavedJobs, useAppliedJobs } from "@/lib/seeker-jobs";
import { Badge } from "@/components/ui/Badge";
import { MatchRing } from "@/components/ui/MatchRing";
import { recommendedJobs, seekerProfile } from "@/lib/data";
import { Search, SlidersHorizontal, MapPin, BookmarkPlus, Bookmark, Send, CheckCircle2 } from "lucide-react";

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Freelance"];
const locations = ["Remote", "Bengaluru", "Pune", "Hyderabad"];

/** Lowest years required, parsed from strings like "5–8 years" or "3+ years". */
function minYears(exp: string) {
  const m = exp.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

export default function JobsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<"search" | "saved">("search");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [locFilter, setLocFilter] = useState<string[]>([]);
  const [maxExp, setMaxExp] = useState(15);
  const { saved, isSaved, toggle } = useSavedJobs();
  const { hasApplied, apply } = useAppliedJobs();
  const [applyJob, setApplyJob] = useState<(typeof recommendedJobs)[number] | null>(null);

  const list = tab === "saved" ? recommendedJobs.filter((j) => saved.includes(j.id)) : recommendedJobs;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((j) => {
      const matchesQuery =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q));
      const matchesType = !typeFilter || j.type === typeFilter;
      const matchesLoc = locFilter.length === 0 || locFilter.some((l) => j.location.toLowerCase().includes(l.toLowerCase()));
      const matchesExp = minYears(j.experience) <= maxExp;
      return matchesQuery && matchesType && matchesLoc && matchesExp;
    });
  }, [list, query, typeFilter, locFilter, maxExp]);

  const filtersActive = !!typeFilter || locFilter.length > 0 || maxExp < 15;

  function toggleSave(id: string, title: string) {
    const wasSaved = isSaved(id);
    toggle(id);
    toast(wasSaved ? `Removed "${title}" from saved jobs.` : `Saved "${title}".`, wasSaved ? "info" : "success");
  }

  return (
    <div>
      <PageHeader
        title="Find your next role"
        subtitle="Search by title, skill, or company. Small typing mistakes are okay too."
      />

      <div className="flex items-center gap-2 mb-5 border-b border-border">
        <button
          onClick={() => setTab("search")}
          className={`px-1 pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === "search" ? "border-brand-500 text-ink" : "border-transparent text-muted"
          }`}
        >
          Search results
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`px-4 pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === "saved" ? "border-brand-500 text-ink" : "border-transparent text-muted"
          }`}
        >
          Saved jobs ({saved.length})
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 shrink-0">
          <div className="rounded-2xl border border-border bg-surface p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4 text-sm font-semibold text-ink">
              <span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</span>
              {filtersActive && (
                <button
                  onClick={() => {
                    setTypeFilter(null);
                    setLocFilter([]);
                    setMaxExp(15);
                  }}
                  className="text-xs font-semibold text-brand-600"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Job type</p>
              <div className="flex flex-col gap-1">
                {jobTypes.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                    <input
                      type="radio"
                      checked={typeFilter === t}
                      onChange={() => setTypeFilter(typeFilter === t ? null : t)}
                      className="accent-[var(--brand-500)]"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Location</p>
              <div className="flex flex-wrap gap-1.5">
                {locations.map((l) => {
                  const on = locFilter.includes(l);
                  return (
                    <button
                      key={l}
                      onClick={() => setLocFilter((f) => (on ? f.filter((x) => x !== l) : [...f, l]))}
                      aria-pressed={on}
                      className={`text-xs rounded-full border px-2.5 py-1 ${
                        on ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold" : "border-border text-muted hover:border-brand-400 hover:text-brand-600"
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Experience required {maxExp < 15 ? `· up to ${maxExp} yrs` : ""}
              </p>
              <input
                type="range"
                min={0}
                max={15}
                value={maxExp}
                onChange={(e) => setMaxExp(Number(e.target.value))}
                aria-label="Maximum years of experience required"
                className="w-full accent-[var(--brand-500)]"
              />
              <div className="flex justify-between text-[11px] text-muted mt-1">
                <span>0 yrs</span>
                <span>15+ yrs</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 mb-4">
            <Search size={16} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search job title, skill, or company"
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((job) => (
              <div key={job.id} className="rounded-2xl border border-border bg-surface p-5 flex flex-col sm:flex-row gap-4">
                <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-display font-bold shrink-0">
                  {job.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/seeker/jobs/${job.id}`} className="font-semibold text-ink hover:text-brand-600">{job.title}</Link>
                      <p className="text-sm text-muted">{job.company}</p>
                    </div>
                    <button onClick={() => toggleSave(job.id, job.title)} aria-label={isSaved(job.id) ? "Unsave job" : "Save job"} className="text-muted hover:text-brand-600 shrink-0">
                      {isSaved(job.id) ? <Bookmark size={18} className="fill-brand-500 text-brand-500" /> : <BookmarkPlus size={18} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mt-2">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                    <span>{job.salary}</span>
                    <span>{job.type}</span>
                    <span>Posted {job.posted}</span>
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {job.skills.map((s) => (
                      <Badge key={s} tone="neutral">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                  <MatchRing value={job.match} size={48} label="match" />
                  {hasApplied(job.id) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-good-100 text-good-500 text-sm font-semibold px-4 py-2 whitespace-nowrap">
                      <CheckCircle2 size={15} /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => setApplyJob(job)}
                      className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 text-sm font-semibold px-4 py-2 whitespace-nowrap"
                    >
                      Easy Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted text-sm">
                {tab === "saved" && saved.length === 0 ? "You haven't saved any jobs yet." : "No jobs match your filters yet."}
              </div>
            )}
          </div>
        </div>
      </div>

      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSubmit={(resume, note) => {
            apply({ jobId: applyJob.id, title: applyJob.title, company: applyJob.company, resume, note });
            toast(`Application sent to ${applyJob.company}.`);
            setApplyJob(null);
          }}
        />
      )}
    </div>
  );
}

function ApplyModal({
  job,
  onClose,
  onSubmit,
}: {
  job: (typeof recommendedJobs)[number];
  onClose: () => void;
  onSubmit: (resume: string, note: string) => void;
}) {
  const [resume, setResume] = useState(seekerProfile.resumeVersions[0]);
  const [note, setNote] = useState("");

  return (
    <Modal
      open
      onClose={onClose}
      title="Apply"
      footer={
        <button
          onClick={() => onSubmit(resume, note.trim())}
          className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold py-2.5 text-sm flex items-center justify-center gap-2"
        >
          <Send size={15} /> Submit application
        </button>
      }
    >
      <p className="text-sm text-muted mb-5 -mt-1">{job.title} · {job.company}</p>

      <label className={labelCls}>Choose a resume</label>
      <select value={resume} onChange={(e) => setResume(e.target.value)} className={`${inputCls} mb-4`}>
        {seekerProfile.resumeVersions.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      <label className={labelCls}>
        Note to recruiter <span className="normal-case text-muted/70">(optional)</span>
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="Say why you're a good fit for this role..."
        className={`${inputCls} resize-none`}
      />
    </Modal>
  );
}
