"use client";

import { Receipt, ScrollText, DatabaseZap } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import SectionCard from "@/components/SectionCard";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function AuditPage() {
  const { state, notify } = useStore();
  const gstSummary = state.gstSummary;

  return (
    <DashboardShell
      title="Tax, Compliance & Audit Center"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/audit"
      requireRole="admin"
    >
      <SectionCard icon={Receipt} title="GST compliance dashboard" description="Consolidated view of GST collected/remitted, HSN/SAC-wise sales summary, and e-invoicing (IRN) status across all vendors.">
        <DataTable
          columns={[
            { key: "state", label: "Vendor Origin State" },
            { key: "hsn", label: "HSN / SAC Codes" },
            { key: "gstCollected", label: "GST Collected", render: (r) => `₹${r.gstCollected.toLocaleString("en-IN")}` },
            { key: "invoicesIRN", label: "e-Invoices (IRN)" },
            { key: "status", label: "Filing Status", render: (r) => <Badge tone={r.status === "Filed" ? "green" : "rose"}>{r.status}</Badge> },
          ]}
          rows={gstSummary}
        />
        <p className="mt-3 text-xs text-ink-muted">CGST/SGST/IGST auto-calculated by vendor origin state and delivery destination state. Dual invoice formats: simplified B2C tax invoice vs detailed B2B tax invoice with buyer GSTIN, PO reference, and item-wise HSN breakup.</p>
      </SectionCard>

      <div className="mt-6">
        <SectionCard icon={ScrollText} title="Activity logs & audit trails" description="Every major action — price changes, product status updates, credit limit changes, RFQ approvals, logins — logged live with timestamp and IP address to prevent internal fraud.">
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {state.activityLogs.map((l) => (
              <div key={l.id} className="flex flex-col gap-0.5 rounded-lg border border-line px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-medium text-ink">{l.actor}</span>
                  <span className="text-ink-muted"> — {l.action}</span>
                </div>
                <span className="text-ink-muted">{l.ip} · {l.time}</span>
              </div>
            ))}
          </div>
          <button onClick={() => api.reports.download("activityLogs")} className="mt-3 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink">Export tamper-evident log (CSV)</button>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard icon={DatabaseZap} title="Data retention & regulatory reports" description="Configurable retention policy and exportable compliance reports for statutory audits.">
          <div className="flex flex-wrap gap-2 text-xs">
            <button onClick={() => api.reports.download("gstSummary")} className="rounded-full border border-line px-3 py-1.5 font-medium text-ink hover:bg-paper">GSTR Summary Export (CSV)</button>
            <button onClick={() => api.reports.download("vendors")} className="rounded-full border border-line px-3 py-1.5 font-medium text-ink hover:bg-paper">Vendor KYC Retention Log (CSV)</button>
            <button disabled title="Requires a GST Suvidha Provider (GSP) integration — not yet connected" className="cursor-not-allowed rounded-full border border-dashed border-line px-3 py-1.5 font-medium text-ink-muted">IRN Reconciliation Report (pending GSP integration)</button>
            <button disabled title="Not yet built" className="cursor-not-allowed rounded-full border border-dashed border-line px-3 py-1.5 font-medium text-ink-muted">DPDP Compliance Report (coming soon)</button>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
