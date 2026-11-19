"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarComparison } from "@/components/charts/BarComparison";
import { useApiData } from "@/lib/hooks/useApiData";
import { propertiesApi } from "@/lib/api/properties";
import { leadsApi } from "@/lib/api/leads";

async function loadAnalytics() {
  const [propertiesRes, leadsRes] = await Promise.all([propertiesApi.mine(), leadsApi.mine()]);
  return { properties: propertiesRes.properties, leads: leadsRes.leads };
}

export default function OwnerAnalyticsPage() {
  const { data, loading, error, reload } = useApiData(loadAnalytics);
  const properties = data?.properties ?? [];
  const leads = data?.leads ?? [];

  const viewsByProperty = properties
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
    .map((p) => ({ label: p.title.length > 24 ? `${p.title.slice(0, 24)}…` : p.title, value: p.views }));

  const inquiriesByProperty = properties
    .slice()
    .sort((a, b) => b.inquiries - a.inquiries)
    .slice(0, 8)
    .map((p) => ({ label: p.title.length > 24 ? `${p.title.slice(0, 24)}…` : p.title, value: p.inquiries }));

  const totalLeads = leads.length;
  const toSiteVisit = leads.filter((l) => ["SITE_VISIT_SCHEDULED", "NEGOTIATION", "CLOSED"].includes(l.stage)).length;
  const toDeal = leads.filter((l) => l.stage === "CLOSED").length;
  const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");

  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle="Analytics"
      pageSubtitle="Listing performance & lead conversion"
    >
      {loading && <LoadingRow label="Crunching your numbers…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader eyebrow="Per listing" title="Views by property" />
              {viewsByProperty.length ? (
                <BarComparison data={viewsByProperty} dataKey="value" horizontal height={260} />
              ) : (
                <EmptyState title="No data yet" description="Views will show up here once your listings go live." />
              )}
            </Card>
            <Card>
              <CardHeader eyebrow="Per listing" title="Inquiries by property" />
              {inquiriesByProperty.length ? (
                <BarComparison data={inquiriesByProperty} dataKey="value" horizontal height={260} />
              ) : (
                <EmptyState title="No data yet" description="Inquiries will show up here as seekers reach out." />
              )}
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader eyebrow="Conversion" title="Lead → site visit → deal" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-stone-50 p-5">
                <p className="font-display text-2xl font-medium text-ink-900">{totalLeads}</p>
                <p className="mt-1 text-xs text-text-500">Total leads</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-5">
                <p className="font-display text-2xl font-medium text-ink-900">{pct(toSiteVisit, totalLeads)}</p>
                <p className="mt-1 text-xs text-text-500">Lead → site visit</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-5">
                <p className="font-display text-2xl font-medium text-ink-900">{pct(toDeal, totalLeads)}</p>
                <p className="mt-1 text-xs text-text-500">Lead → closed deal</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
