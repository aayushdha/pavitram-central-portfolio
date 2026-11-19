"use client";

import { CalendarPlus, MapPin } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { seekerNav } from "@/lib/nav-config";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { siteVisitsApi } from "@/lib/api/site-visits";
import { SiteVisit, SiteVisitStatus } from "@/lib/api/domain-types";

const statusVariant: Record<SiteVisitStatus, "success" | "warning" | "neutral" | "danger"> = {
  CONFIRMED: "success",
  REQUESTED: "warning",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  RESCHEDULED: "warning",
};
const statusLabel: Record<SiteVisitStatus, string> = {
  CONFIRMED: "Confirmed",
  REQUESTED: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
};

export default function SeekerSiteVisitsPage() {
  const { data, loading, error, reload, setData } = useApiData(() => siteVisitsApi.mineAsSeeker());
  const visits = data?.siteVisits ?? [];

  async function handleReschedule(v: SiteVisit) {
    const input = prompt("New date & time (YYYY-MM-DD HH:mm)", new Date(v.scheduledAt).toISOString().slice(0, 16).replace("T", " "));
    if (!input) return;
    const iso = new Date(input.replace(" ", "T")).toISOString();
    if (Number.isNaN(new Date(iso).getTime())) {
      alert("Couldn't understand that date/time.");
      return;
    }
    try {
      const res = await siteVisitsApi.update(v.id, { scheduledAt: iso, status: "RESCHEDULED" });
      setData({ siteVisits: visits.map((x) => (x.id === v.id ? res.siteVisit : x)) });
    } catch {
      alert("Could not reschedule this visit. Please try again.");
    }
  }

  async function handleCancel(v: SiteVisit) {
    if (!confirm("Cancel this site visit?")) return;
    try {
      const res = await siteVisitsApi.update(v.id, { status: "CANCELLED" });
      setData({ siteVisits: visits.map((x) => (x.id === v.id ? res.siteVisit : x)) });
    } catch {
      alert("Could not cancel this visit. Please try again.");
    }
  }

  return (
    <DashboardShell
      groups={seekerNav}
      pageTitle="Site visits"
      pageSubtitle="Scheduled, pending & completed visits"
    >
      <div className="mb-5 flex justify-end">
        <Button href="/properties" variant="primary" size="sm" icon={<CalendarPlus size={14} />}>
          Schedule a visit
        </Button>
      </div>

      {loading && <LoadingRow label="Loading your site visits…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        visits.length === 0 ? (
          <EmptyState
            title="No site visits yet"
            description="Request a site visit from any property page and it'll show up here."
          />
        ) : (
          <div className="space-y-4">
            {visits.map((v) => {
              const d = new Date(v.scheduledAt);
              return (
                <Card key={v.id}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-stone-100 text-ink-900">
                        <span className="text-[10px] uppercase leading-none text-text-500">
                          {d.toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                        <span className="text-base font-semibold leading-tight">{d.getDate()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-ink-900">
                          {v.property?.title ?? v.project?.name ?? "Property visit"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-text-500">
                          <MapPin size={12} /> {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · with {v.host?.name ?? "host"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant[v.status]}>{statusLabel[v.status]}</Badge>
                      {v.status !== "COMPLETED" && v.status !== "CANCELLED" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleReschedule(v)}>Reschedule</Button>
                          <Button variant="ghost" size="sm" className="text-danger-600" onClick={() => handleCancel(v)}>Cancel</Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}
    </DashboardShell>
  );
}
