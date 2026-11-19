"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { adminApi } from "@/lib/api/admin";
import { Project, Property } from "@/lib/api/domain-types";

type QueueRow =
  | { kind: "Property"; id: string; title: string; postedBy: string; city: string; submitted: string; raw: Property }
  | { kind: "Project"; id: string; title: string; postedBy: string; city: string; submitted: string; raw: Project };

async function loadQueue() {
  const [propsRes, projectsRes] = await Promise.all([adminApi.pendingProperties(), adminApi.pendingProjects()]);
  return { properties: propsRes.properties, projects: projectsRes.projects };
}

export default function AdminListingsPage() {
  const { data, loading, error, reload, setData } = useApiData(loadQueue);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows: QueueRow[] = [
    ...(data?.properties ?? []).map((p) => ({
      kind: "Property" as const,
      id: p.id,
      title: p.title,
      postedBy: p.owner?.name ?? p.owner?.email ?? "—",
      city: p.city,
      submitted: new Date(p.createdAt).toLocaleDateString("en-IN"),
      raw: p,
    })),
    ...(data?.projects ?? []).map((p) => ({
      kind: "Project" as const,
      id: p.id,
      title: p.name,
      postedBy: p.builder?.name ?? p.builder?.email ?? "—",
      city: p.city,
      submitted: new Date(p.createdAt).toLocaleDateString("en-IN"),
      raw: p,
    })),
  ];

  async function moderate(row: QueueRow, status: "APPROVED" | "REJECTED") {
    setBusyId(row.id);
    try {
      if (row.kind === "Property") {
        await adminApi.moderateProperty(row.id, status);
        setData((prev) => (prev ? { ...prev, properties: prev.properties.filter((p) => p.id !== row.id) } : prev));
      } else {
        await adminApi.moderateProject(row.id, status);
        setData((prev) => (prev ? { ...prev, projects: prev.projects.filter((p) => p.id !== row.id) } : prev));
      }
    } catch {
      alert("Could not update this listing. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const cols: Column<QueueRow>[] = [
    {
      header: "Listing",
      accessor: (r) => (
        <div>
          <p className="font-medium text-ink-900">{r.title}</p>
          <p className="font-mono text-xs text-text-400">{r.id.slice(0, 10)}</p>
        </div>
      ),
    },
    { header: "Posted by", accessor: (r) => r.postedBy },
    { header: "Type", accessor: (r) => <Badge variant="neutral">{r.kind}</Badge> },
    { header: "City", accessor: (r) => r.city },
    { header: "Submitted", accessor: (r) => <span className="text-xs text-text-500">{r.submitted}</span> },
    { header: "Status", accessor: () => <Badge variant="warning">Pending Review</Badge> },
    {
      header: "Actions",
      accessor: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="primary" size="sm" disabled={busyId === r.id} onClick={() => moderate(r, "APPROVED")}>
            {busyId === r.id ? "…" : "Approve"}
          </Button>
          <Button variant="ghost" size="sm" className="text-danger-600" disabled={busyId === r.id} onClick={() => moderate(r, "REJECTED")}>
            Reject
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Check & approve listings"
      pageSubtitle="Approve new property & project submissions"
    >
      {loading && <LoadingRow label="Loading the approval queue…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <Card padded={false}>
            <div className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardHeader
                eyebrow={`${rows.length} in queue`}
                title="Approval queue"
                subtitle="New property & project submissions awaiting review"
              />
            </div>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              {rows.length ? (
                <DataTable columns={cols} data={rows} keyField={(r) => `${r.kind}-${r.id}`} />
              ) : (
                <EmptyState title="Queue is empty" description="Nothing is waiting for review right now." />
              )}
            </div>
          </Card>

          <Card className="mt-6">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand-600" />
              <div>
                <p className="font-medium text-ink-900">RERA registry cross-check</p>
                <p className="mt-1 text-sm text-text-600">
                  New-project listings ask for a RERA number at submission time. Automated cross-checking against
                  the government registry isn&apos;t wired up yet — approvals here are manual until that
                  integration is added.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
