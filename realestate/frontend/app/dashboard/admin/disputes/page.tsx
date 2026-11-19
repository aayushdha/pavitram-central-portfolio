import { DashboardShell } from "@/components/layout/DashboardShell";
import { PreviewBanner } from "@/components/dashboard/PreviewBanner";
import { adminNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { disputes } from "@/lib/mock-data";

export default function AdminDisputesPage() {
  const cols: Column<(typeof disputes)[number]>[] = [
    { header: "Ticket", accessor: (r) => <span className="font-mono text-xs">{r.id}</span> },
    {
      header: "Subject",
      accessor: (r) => (
        <div>
          <p className="font-medium text-ink-900">{r.subject}</p>
          <p className="text-xs text-text-400">
            {r.raisedBy} vs. {r.against}
          </p>
        </div>
      ),
    },
    {
      header: "Severity",
      accessor: (r) => (
        <Badge variant={r.severity === "High" ? "danger" : r.severity === "Medium" ? "warning" : "neutral"}>
          {r.severity}
        </Badge>
      ),
    },
    {
      header: "Time left",
      accessor: (r) => <span className={r.sla === "Breached" ? "font-medium text-danger-600" : "text-text-600"}>{r.sla}</span>,
    },
    {
      header: "Status",
      accessor: (r) => (
        <Badge variant={r.status === "Escalated" ? "danger" : r.status === "In Progress" ? "warning" : "neutral"}>
          {r.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: () => (
        <div className="flex justify-end gap-2">
          <Button variant="primary" size="sm">Resolve</Button>
          <Button variant="ghost" size="sm">Assign</Button>
        </div>
      ),
      align: "right",
    },
  ];

  const bySeverity = { High: disputes.filter((d) => d.severity === "High").length, Medium: disputes.filter((d) => d.severity === "Medium").length, Low: disputes.filter((d) => d.severity === "Low").length };

  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Complaints & support"
      pageSubtitle="Handle complaints from seekers, owners, agents & builders"
    >
      <PreviewBanner>
        There&apos;s no disputes/support-ticket model on the backend yet. This page shows the intended queue
        and workflow with sample tickets until a `disputes` module is added to the backend.
      </PreviewBanner>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-text-600">High severity</p>
          <p className="mt-2 font-display text-3xl font-medium text-danger-600">{bySeverity.High}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-600">Medium severity</p>
          <p className="mt-2 font-display text-3xl font-medium text-brass-600">{bySeverity.Medium}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-600">Low severity</p>
          <p className="mt-2 font-display text-3xl font-medium text-ink-900">{bySeverity.Low}</p>
        </Card>
      </div>

      <Card className="mt-6" padded={false}>
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <CardHeader eyebrow="All complaints" title="Open tickets" subtitle="Sorted by how urgent they are" />
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <DataTable columns={cols} data={disputes} keyField={(r) => r.id} />
        </div>
      </Card>
    </DashboardShell>
  );
}
