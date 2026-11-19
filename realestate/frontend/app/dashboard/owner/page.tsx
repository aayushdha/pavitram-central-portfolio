"use client";

import { useMemo } from "react";
import { Building2, Contact, CalendarClock, Wallet, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { BarComparison } from "@/components/charts/BarComparison";
import { useApiData } from "@/lib/hooks/useApiData";
import { propertiesApi } from "@/lib/api/properties";
import { leadsApi } from "@/lib/api/leads";
import { siteVisitsApi } from "@/lib/api/site-visits";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { LeadStage } from "@/lib/api/domain-types";
import { useAuth } from "@/lib/auth/AuthProvider";

const stageLabels: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT_SCHEDULED: "Site Visit",
  NEGOTIATION: "Negotiation",
  CLOSED: "Closed",
  LOST: "Lost",
};
const funnelStages: LeadStage[] = ["NEW", "CONTACTED", "SITE_VISIT_SCHEDULED", "NEGOTIATION", "CLOSED"];

async function loadOverview() {
  const [propertiesRes, leadsRes, visitsRes, subsRes] = await Promise.all([
    propertiesApi.mine(),
    leadsApi.mine(),
    siteVisitsApi.mineAsHost(),
    subscriptionsApi.mine(),
  ]);
  return {
    properties: propertiesRes.properties,
    leads: leadsRes.leads,
    siteVisits: visitsRes.siteVisits,
    subscriptions: subsRes.subscriptions,
  };
}

export default function OwnerOverviewPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApiData(loadOverview);

  const properties = data?.properties ?? [];
  const leads = data?.leads ?? [];
  const siteVisits = data?.siteVisits ?? [];
  const activeSub = data?.subscriptions.find((s) => s.status === "ACTIVE");

  const funnel = funnelStages.map((s) => ({
    label: stageLabels[s],
    value: leads.filter((l) => l.stage === s).length,
  }));
  const recentLeads = [...leads].sort((a, b) => b.intentScore - a.intentScore).slice(0, 4);
  const upcomingVisits = siteVisits.filter((v) => v.status === "REQUESTED" || v.status === "CONFIRMED");
  // eslint-disable-next-line react-hooks/purity -- Date.now() intentionally frozen once per mount via useMemo for a stable "within the last 7 days" cutoff
  const weekAgo = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);
  const newLeadsThisWeek = leads.filter(
    (l) => new Date(l.createdAt).getTime() > weekAgo,
  ).length;

  return (
    <DashboardShell
      groups={ownerNav}
      roleLabel={user?.businessName ?? "Owner / Agent / Builder"}
      roleColor="brass"
      pageTitle="Owner dashboard"
      pageSubtitle="Overview across listings, leads & credits"
    >
      {loading && <LoadingRow label="Loading your dashboard…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Active listings" value={String(properties.filter((p) => p.isActive).length)} icon={<Building2 size={16} />} hint="live + pending" />
            <StatCard label="New leads (7d)" value={String(newLeadsThisWeek)} icon={<Contact size={16} />} hint="vs last week" />
            <StatCard label="Site visits scheduled" value={String(upcomingVisits.length)} icon={<CalendarClock size={16} />} hint="upcoming" />
            <StatCard label="Credit balance" value={String(activeSub?.creditsRemaining ?? 0)} icon={<Wallet size={16} />} hint={activeSub?.planCode ?? "No active plan"} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader eyebrow="Pipeline" title="Lead funnel" subtitle="New → Contacted → Site Visit → Negotiation → Closed" />
              {leads.length ? <BarComparison data={funnel} dataKey="value" height={240} /> : (
                <EmptyState title="No leads yet" description="Leads from enquiries on your listings will show up here." />
              )}
            </Card>

            <Card>
              <CardHeader
                eyebrow="Highest intent"
                title="Recent leads"
                action={
                  <Button href="/dashboard/owner/leads" variant="ghost" size="sm" icon={<ArrowRight size={14} />}>
                    All
                  </Button>
                }
              />
              {recentLeads.length ? (
                <ul className="space-y-3">
                  {recentLeads.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{l.name}</p>
                        <p className="truncate text-xs text-text-400">{l.property?.title ?? "General enquiry"}</p>
                      </div>
                      <Badge variant={l.intentScore >= 80 ? "success" : "neutral"}>{l.intentScore}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-text-400">No leads yet.</p>
              )}
            </Card>
          </div>

          <Card className="mt-6" padded={false}>
            <div className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardHeader
                eyebrow="Inventory"
                title="Your listings"
                action={
                  <Button href="/dashboard/owner/listings" variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                    Manage all
                  </Button>
                }
              />
            </div>
            {properties.length ? (
              <ul className="divide-y divide-stone-100 px-5 pb-5 sm:px-6 sm:pb-6">
                {properties.slice(0, 5).map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{l.title}</p>
                      <p className="text-xs text-text-400">
                        {l.views} views · {l.inquiries} inquiries
                      </p>
                    </div>
                    <Badge variant={l.status === "APPROVED" ? "success" : l.status === "PENDING_REVIEW" ? "warning" : "neutral"}>
                      {l.status === "APPROVED" ? "Live" : l.status === "PENDING_REVIEW" ? "Under Review" : l.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 sm:p-6">
                <EmptyState
                  title="You haven't listed anything yet"
                  description="Post your first property to start receiving leads."
                  action={<Button href="/dashboard/owner/listings/new" variant="primary" size="sm">Post a property</Button>}
                />
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
