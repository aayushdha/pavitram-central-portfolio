"use client";

import { Info } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { providersApi } from "@/lib/api/providers";
import { ServiceProvider } from "@/lib/api/domain-types";

const commissionByCategory = [
  { category: "Material Suppliers", commission: "4%" },
  { category: "Legal Services", commission: "12%" },
  { category: "Home Services", commission: "18%" },
  { category: "Finance & Loans", commission: "1.2% of loan value" },
];

export default function AdminServicesGovernancePage() {
  const { data, loading, error, reload } = useApiData(() => providersApi.list());
  const providers = data?.providers ?? [];

  const cols: Column<ServiceProvider>[] = [
    { header: "Provider", accessor: (r) => <span className="font-medium text-ink-900">{r.displayName}</span> },
    { header: "Category", accessor: (r) => <Badge variant="neutral">{r.category.replace("_", " ")}</Badge> },
    { header: "City", accessor: (r) => r.city },
    { header: "Rating", accessor: (r) => `${r.ratingAvg.toFixed(1)} ★ (${r.ratingCount})` },
    { header: "Status", accessor: (r) => <Badge variant={r.verified ? "verified" : "warning"}>{r.verified ? "Verified" : "Pending"}</Badge> },
  ];

  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Manage services"
      pageSubtitle="Service provider marketplace directory"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <CardHeader eyebrow="Directory" title="Service providers" subtitle="Material, legal, home services & finance" />
          </div>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            {loading && <LoadingRow label="Loading providers…" />}
            {error && <ErrorRow message={error} onRetry={reload} />}
            {!loading && !error && (
              providers.length ? (
                <>
                  <DataTable columns={cols} data={providers} keyField={(r) => r.id} />
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-info-100/30 p-3 text-xs text-text-600">
                    <Info size={13} className="mt-0.5 shrink-0 text-info-600" />
                    Approve/suspend actions for providers aren&apos;t wired up yet — the backend has no
                    moderation endpoint for `RealServiceProvider` yet (only properties, projects, and KYC
                    documents currently have one).
                  </div>
                </>
              ) : (
                <EmptyState title="No providers yet" description="Service providers will appear here once they set up a profile." />
              )
            )}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Policy" title="Commission by category" />
          <ul className="space-y-3">
            {commissionByCategory.map((c) => (
              <li key={c.category} className="flex items-center justify-between rounded-xl border border-stone-200 p-3.5">
                <span className="text-sm text-text-700">{c.category}</span>
                <span className="font-mono text-sm font-medium text-ink-900">{c.commission}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-text-400">
            Illustrative — there&apos;s no commission-policy model on the backend yet to persist edits.
          </p>
        </Card>
      </div>
    </DashboardShell>
  );
}
