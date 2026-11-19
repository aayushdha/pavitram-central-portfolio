"use client";

import { Users, Building2, ShieldCheck, BadgeCheck, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/nav-config";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { DonutChart } from "@/components/charts/DonutChart";
import { useApiData } from "@/lib/hooks/useApiData";
import { adminApi } from "@/lib/api/admin";

async function loadOverview() {
  const [overviewRes, propsRes, projectsRes, kycRes] = await Promise.all([
    adminApi.overview(),
    adminApi.pendingProperties(),
    adminApi.pendingProjects(),
    adminApi.pendingKyc(),
  ]);
  return {
    overview: overviewRes.overview,
    pendingProperties: propsRes.properties,
    pendingProjects: projectsRes.projects,
    pendingKyc: kycRes.documents,
  };
}

export default function AdminOverviewPage() {
  const { data, loading, error, reload } = useApiData(loadOverview);
  const overview = data?.overview;

  const queue = [
    ...(data?.pendingProperties ?? []).map((p) => ({ id: p.id, title: p.title, owner: p.owner?.name ?? p.owner?.email ?? "—", city: p.city, kind: "Property" })),
    ...(data?.pendingProjects ?? []).map((p) => ({ id: p.id, title: p.name, owner: p.builder?.name ?? p.builder?.email ?? "—", city: p.city, kind: "Project" })),
  ].slice(0, 6);

  const roleSplit = overview
    ? [
        { label: "Seekers", value: overview.seekers },
        { label: "Owners/Agents/Builders", value: overview.owners },
        { label: "Service Providers", value: overview.providers },
      ]
    : [];

  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Admin dashboard"
      pageSubtitle="Manage listings, users & trust across the platform"
    >
      {loading && <LoadingRow label="Loading platform overview…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && overview && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total users" value={overview.totalUsers.toLocaleString("en-IN")} icon={<Users size={16} />} hint={`${overview.seekers} seekers`} />
            <StatCard label="Owners / Agents / Builders" value={overview.owners.toLocaleString("en-IN")} icon={<Building2 size={16} />} />
            <StatCard label="Live properties" value={overview.totalProperties.toLocaleString("en-IN")} icon={<ShieldCheck size={16} />} hint={`${overview.pendingProperties} pending review`} />
            <StatCard label="Live projects" value={overview.totalProjects.toLocaleString("en-IN")} icon={<BadgeCheck size={16} />} hint={`${overview.pendingProjects} pending review`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                eyebrow={`${queue.length} awaiting action`}
                title="Listing approval queue"
                subtitle="New property & project submissions"
                action={
                  <Button href="/dashboard/admin/listings" variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                    Open queue
                  </Button>
                }
              />
              {queue.length ? (
                <ul className="divide-y divide-stone-100">
                  {queue.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{m.title}</p>
                        <p className="truncate text-xs text-text-500">{m.owner} · {m.city}</p>
                      </div>
                      <Badge variant="warning">{m.kind}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-text-400">Nothing pending review right now.</p>
              )}
            </Card>
            <Card>
              <CardHeader eyebrow="Community" title="Users by role" />
              {overview.totalUsers ? <DonutChart data={roleSplit} height={190} /> : <p className="py-6 text-center text-sm text-text-400">No users yet.</p>}
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader eyebrow="KYC" title={`${overview.pendingKyc} documents awaiting review`} action={
              <Button href="/dashboard/admin/users" variant="ghost" size="sm" icon={<ArrowRight size={14} />}>
                Review
              </Button>
            } />
            <p className="text-sm text-text-600">
              Owner, agent and builder identity documents are reviewed from the Users &amp; KYC section.
            </p>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
