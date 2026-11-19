"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, stageTone } from "@/components/ui/Badge";
import { seekerApplications, pipelineStages, PipelineStage } from "@/lib/data";
import { useAppliedJobs } from "@/lib/seeker-jobs";

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<PipelineStage | "All">("All");

  const { applied } = useAppliedJobs();
  // Applications sent from the Jobs page show up here straight away, at the "Applied" stage.
  const all = [
    ...applied.map((a) => ({
      id: `local-${a.jobId}`,
      job: a.title,
      company: a.company,
      stage: "Applied" as PipelineStage,
      applied: a.date,
      updated: a.date,
    })),
    ...seekerApplications,
  ];
  const rows = all.filter((a) => filter === "All" || a.stage === filter);
  const counts = pipelineStages.map((s) => ({
    stage: s,
    count: all.filter((a) => a.stage === s).length,
  }));

  return (
    <div>
      <PageHeader title="Application tracker" subtitle="See the live status of every job you've applied to." />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {counts.map((c) => (
          <button
            key={c.stage}
            onClick={() => setFilter(filter === c.stage ? "All" : c.stage)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              filter === c.stage ? "border-brand-500 bg-brand-50" : "border-border bg-surface hover:border-brand-300"
            }`}
          >
            <p className="font-display text-xl font-bold text-ink">{c.count}</p>
            <p className="text-xs text-muted mt-1">{c.stage}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-border">
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Applied</th>
              <th className="px-5 py-3 font-medium">Last update</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-background/60">
                <td className="px-5 py-3.5 font-medium text-ink">{a.job}</td>
                <td className="px-5 py-3.5 text-muted">{a.company}</td>
                <td className="px-5 py-3.5 text-muted">{a.applied}</td>
                <td className="px-5 py-3.5 text-muted">{a.updated}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={stageTone(a.stage)}>{a.stage}</Badge>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  No applications in this stage.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
