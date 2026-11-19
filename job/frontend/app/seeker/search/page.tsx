"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { MatchRing } from "@/components/ui/MatchRing";
import { recommendedJobs, people, companies } from "@/lib/data";
import { Briefcase, Users2, Building2 } from "lucide-react";

function SearchResults() {
  const params = useSearchParams();
  const q = (params.get("q") || "").toLowerCase();
  const [tab, setTab] = useState<"all" | "jobs" | "people" | "companies">("all");

  const jobs = recommendedJobs.filter((j) => !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
  const peopleRes = people.filter((p) => !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  const companiesRes = companies.filter((c) => !q || c.name.toLowerCase().includes(q));

  const tabs = [
    { id: "all", label: "All" },
    { id: "jobs", label: `Jobs (${jobs.length})` },
    { id: "people", label: `People (${peopleRes.length})` },
    { id: "companies", label: `Companies (${companiesRes.length})` },
  ] as const;

  return (
    <div>
      <PageHeader title={q ? `Results for "${q}"` : "Search"} subtitle="Jobs, people, and companies that match." />

      <div className="flex items-center gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              tab === t.id ? "bg-ink-900 text-white border-ink-900" : "border-border text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === "all" || tab === "jobs") && jobs.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Briefcase size={18} className="text-brand-600" /> Jobs</h2>
          <div className="flex flex-col gap-3">
            {jobs.map((j) => (
              <Link key={j.id} href={`/seeker/jobs/${j.id}`} className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-4 hover:border-brand-400">
                <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">{j.logo}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{j.title}</p>
                  <p className="text-xs text-muted truncate">{j.company} · {j.location}</p>
                </div>
                <MatchRing value={j.match} size={32} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {(tab === "all" || tab === "people") && peopleRes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Users2 size={18} className="text-brand-600" /> People</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {peopleRes.map((p) => (
              <Link key={p.id} href="/seeker/people" className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-3 hover:border-brand-400">
                <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-muted truncate">{p.role} · {p.company}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(tab === "all" || tab === "companies") && companiesRes.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Building2 size={18} className="text-brand-600" /> Companies</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {companiesRes.map((c) => (
              <Link key={c.id} href={`/seeker/companies/${c.id}`} className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-3 hover:border-brand-400">
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center text-xs font-bold shrink-0">{c.logo}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{c.name}</p>
                  <p className="text-xs text-muted truncate">{c.industry}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && peopleRes.length === 0 && companiesRes.length === 0 && (
        <div className="text-center py-16 text-muted text-sm">No results found.</div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
