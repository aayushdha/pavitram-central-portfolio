import { Lock, FileClock, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PreviewBanner } from "@/components/dashboard/PreviewBanner";
import { adminNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { auditLog, fraudSignals } from "@/lib/mock-data";

export default function AdminSecurityPage() {
  const cols: Column<(typeof auditLog)[number]>[] = [
    { header: "Action", accessor: (r) => <span className="font-medium text-ink-900">{r.action}</span> },
    { header: "Actor", accessor: (r) => <span className="font-mono text-xs">{r.actor}</span> },
    { header: "Target", accessor: (r) => <span className="font-mono text-xs">{r.target}</span> },
    { header: "Time", accessor: (r) => r.time },
    { header: "IP Address", accessor: (r) => <span className="font-mono text-xs text-text-400">{r.ip}</span> },
  ];

  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Security & activity log"
      pageSubtitle="See who did what, and watch for fraud"
    >
      <PreviewBanner>
        The `RealAuditLog` table exists in the database schema, but no backend endpoint reads it yet, and
        there&apos;s no fraud-scoring model. This page shows the intended layout with sample entries until an
        `/admin/audit-log` route (and a fraud-signals job) are added.
      </PreviewBanner>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2.5">
            <Lock size={17} className="text-brand-600" />
            <p className="font-medium text-ink-900">Two-factor authentication</p>
          </div>
          <p className="mt-2 text-sm text-text-600">Mandatory for all Admin and Builder/Agency accounts.</p>
          <Badge variant="verified" className="mt-3">Enforced</Badge>
        </Card>
        <Card>
          <div className="flex items-center gap-2.5">
            <FileClock size={17} className="text-brand-600" />
            <p className="font-medium text-ink-900">Data retention policy</p>
          </div>
          <p className="mt-2 text-sm text-text-600">Transaction & communication records retained for 7 years per DPDP guidance.</p>
          <Badge variant="neutral" className="mt-3">Configurable</Badge>
        </Card>
        <Card>
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={17} className="text-danger-600" />
            <p className="font-medium text-ink-900">Open risk signals</p>
          </div>
          <p className="mt-2 text-sm text-text-600">{fraudSignals.length} listings currently above the review threshold.</p>
          <Badge variant="warning" className="mt-3">Needs review</Badge>
        </Card>
      </div>

      <Card className="mt-6" padded={false}>
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <CardHeader eyebrow="Every action, logged" title="Activity log" subtitle="Time and IP address for every action taken" />
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <DataTable columns={cols} data={auditLog} keyField={(r) => r.id} />
        </div>
      </Card>
    </DashboardShell>
  );
}
