"use client";

import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function AdminAnalyticsPage() {
  const { state, notify } = useStore();
  const { gmvTrend, cohorts, vendorScorecards } = state;
  const maxGmv = Math.max(1, ...gmvTrend.map((m) => m.b2c + m.b2b));

  const b2cOrders = state.orders.filter((o) => o.type === "B2C");
  const b2bOrders = state.orders.filter((o) => o.type === "B2B");
  const gmv = state.orders.reduce((s, o) => s + o.amount, 0);
  const aovB2C = b2cOrders.length ? Math.round(b2cOrders.reduce((s, o) => s + o.amount, 0) / b2cOrders.length) : 0;
  const aovB2B = b2bOrders.length ? Math.round(b2bOrders.reduce((s, o) => s + o.amount, 0) / b2bOrders.length) : 0;

  const exportReport = (name, entity) => {
    api.reports.download(entity);
    notify(`Downloading ${name} report…`);
  };

  return (
    <DashboardShell
      title="Analytics & Business Intelligence"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/analytics"
      requireRole="admin"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Unified GMV (live orders)" value={`₹${gmv.toLocaleString("en-IN")}`} tone="gold" sub={`${state.orders.length} orders`} />
        <StatCard label="B2C Orders" value={b2cOrders.length} tone="jade" />
        <StatCard label="Avg Order Value (B2C)" value={`₹${aovB2C.toLocaleString("en-IN")}`} />
        <StatCard label="Avg Order Value (B2B)" value={`₹${aovB2B.toLocaleString("en-IN")}`} tone="jade" />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-5">
        <h3 className="font-display text-base font-semibold text-ink">Unified GMV trend — B2C vs B2B</h3>
        <p className="text-xs text-ink-muted">Unified data warehouse combining B2C and B2B transactional data for cross-channel insight.</p>
        <div className="mt-5 flex items-end gap-4">
          {gmvTrend.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-40 w-full items-end gap-1">
                <div
                  className="w-1/2 rounded-t-md"
                  style={{ height: `${(m.b2c / maxGmv) * 100}%`, background: "var(--color-gold)" }}
                  title={`B2C ₹${m.b2c}Cr`}
                />
                <div
                  className="w-1/2 rounded-t-md"
                  style={{ height: `${(m.b2b / maxGmv) * 100}%`, background: "var(--color-jade)" }}
                  title={`B2B ₹${m.b2b}Cr`}
                />
              </div>
              <span className="text-xs text-ink-muted">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--color-gold)" }} /> B2C</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--color-jade)" }} /> B2B</span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-display text-base font-semibold text-ink">Cohort & RFM analysis</h3>
        <p className="text-xs text-ink-muted">Recency-Frequency-Monetary segmentation across retail customers and business buyers.</p>
        <div className="mt-3">
          <DataTable
            columns={[
              { key: "segment", label: "Segment" },
              { key: "retail", label: "Retail Share" },
              { key: "business", label: "Business Share" },
              { key: "risk", label: "Signal" },
            ]}
            rows={cohorts}
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-display text-base font-semibold text-ink">Vendor scorecards</h3>
        <p className="text-xs text-ink-muted">Composite score combining fulfillment SLA, quality/return rate, and responsiveness to RFQs.</p>
        <div className="mt-3">
          <DataTable
            columns={[
              { key: "vendor", label: "Vendor" },
              { key: "sla", label: "Fulfillment SLA", render: (r) => `${r.sla}%` },
              { key: "quality", label: "Quality Rating" },
              { key: "rfqResponse", label: "Avg RFQ Response" },
              { key: "composite", label: "Composite Score", render: (r) => <Badge tone={r.composite === "C" ? "rose" : "green"}>{r.composite}</Badge> },
            ]}
            rows={vendorScorecards}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-5">
        <h3 className="font-display text-base font-semibold text-ink">Custom report builder</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Export any of these as a CSV file — opens as a real download, not a placeholder.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["Vendor performance", "vendorScorecards"],
            ["GST HSN summary", "gstSummary"],
            ["RFM cohort", "cohorts"],
            ["Credit exposure", "businessBuyers"],
          ].map(([label, entity]) => (
            <button key={label} onClick={() => exportReport(label, entity)} className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink hover:bg-paper-raised">
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => exportReport("Orders", "orders")} className="mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--color-ink)" }}>
          Export orders (CSV)
        </button>
      </div>
    </DashboardShell>
  );
}
