"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { companies } from "@/lib/data";
import { Search, Star, Users2, MapPin, Briefcase } from "lucide-react";

export default function CompaniesPage() {
  const [query, setQuery] = useState("");
  const filtered = companies.filter((c) => !query || c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Companies" subtitle="Explore companies, read reviews, and see who's hiring." />

      <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 mb-6 max-w-md">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies"
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <Link key={c.id} href={`/seeker/companies/${c.id}`} className="rounded-2xl border border-border bg-surface p-5 hover:border-brand-400 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-display font-bold shrink-0">
                {c.logo}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-ink truncate">{c.name}</p>
                <p className="text-xs text-muted truncate">{c.industry}</p>
              </div>
            </div>
            <p className="text-sm text-muted line-clamp-2 mb-3">{c.about}</p>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1"><Star size={12} className="text-warn-500 fill-warn-500" /> {c.rating} ({c.reviews})</span>
              <span className="flex items-center gap-1"><Users2 size={12} /> {c.size}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted mt-1.5">
              <span className="flex items-center gap-1"><MapPin size={12} /> {c.hq}</span>
              <span className="flex items-center gap-1"><Briefcase size={12} /> {c.openJobIds.length} open role{c.openJobIds.length !== 1 ? "s" : ""}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
