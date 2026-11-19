"use client";

import { Phone, Clock } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { leadsApi } from "@/lib/api/leads";
import { Lead, LeadStage } from "@/lib/api/domain-types";

const leadStages: LeadStage[] = ["NEW", "CONTACTED", "SITE_VISIT_SCHEDULED", "NEGOTIATION", "CLOSED", "LOST"];
const stageLabel: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT_SCHEDULED: "Site Visit Scheduled",
  NEGOTIATION: "Negotiation",
  CLOSED: "Closed",
  LOST: "Lost",
};
const stageColor: Record<LeadStage, string> = {
  NEW: "border-info-100 bg-info-100/40",
  CONTACTED: "border-stone-200 bg-stone-50",
  SITE_VISIT_SCHEDULED: "border-brand-100 bg-brand-50/50",
  NEGOTIATION: "border-brass-200 bg-brass-50/50",
  CLOSED: "border-brand-200 bg-brand-50",
  LOST: "border-danger-100 bg-danger-50/50",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function OwnerLeadsPage() {
  const { data, loading, error, reload, setData } = useApiData(() => leadsApi.mine());
  const leads = data?.leads ?? [];

  async function moveStage(lead: Lead, stage: LeadStage) {
    const prev = leads;
    setData({ leads: leads.map((l) => (l.id === lead.id ? { ...l, stage } : l)) });
    try {
      await leadsApi.update(lead.id, { stage });
    } catch {
      setData({ leads: prev });
      alert("Could not update this lead's stage. Please try again.");
    }
  }

  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle="Leads (CRM)"
      pageSubtitle="Every inquiry in one place, sorted by how likely they are to buy"
    >
      {loading && <LoadingRow label="Loading your leads…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        leads.length === 0 ? (
          <EmptyState
            title="No leads yet"
            description="When seekers enquire about your listings, they'll show up here as leads you can move through your pipeline."
          />
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-4 sm:grid sm:min-w-0 sm:grid-cols-3 lg:grid-cols-6">
              {leadStages.map((stage) => {
                const stageLeads = leads.filter((l) => l.stage === stage);
                return (
                  <div key={stage} className="w-64 shrink-0 sm:w-auto">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-500">{stageLabel[stage]}</p>
                      <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[11px] text-text-500">
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {stageLeads.map((l) => (
                        <div key={l.id} className={`rounded-xl border p-3.5 ${stageColor[stage]}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-ink-900">{l.name}</p>
                            <Badge variant={l.intentScore >= 80 ? "success" : l.intentScore >= 50 ? "warning" : "neutral"}>
                              {l.intentScore}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-xs text-text-500">{l.property?.title ?? "General enquiry"}</p>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-400">
                            <span className="flex items-center gap-1">
                              <Phone size={10} /> {l.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {timeAgo(l.lastActivityAt)}
                            </span>
                          </div>
                          <select
                            value={l.stage}
                            onChange={(e) => moveStage(l, e.target.value as LeadStage)}
                            className="mt-2.5 w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-[11px] text-ink-900 outline-none focus:border-brass-400"
                          >
                            {leadStages.map((s) => (
                              <option key={s} value={s}>
                                Move to: {stageLabel[s]}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                      {stageLeads.length === 0 && (
                        <div className="rounded-xl border border-dashed border-stone-200 p-4 text-center text-xs text-text-400">
                          No leads
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      <Card className="mt-8">
        <p className="font-medium text-ink-900">Follow-up automation</p>
        <p className="mt-1 text-sm text-text-600">
          Leads untouched for more than 4 hours trigger an automatic reminder to you and a
          templated nudge message to the seeker — configurable per stage.
        </p>
      </Card>
    </DashboardShell>
  );
}
