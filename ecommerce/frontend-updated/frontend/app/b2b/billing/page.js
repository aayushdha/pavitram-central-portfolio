"use client";

import { useState } from "react";
import { CreditCard, FileText } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import SectionCard from "@/components/SectionCard";
import { b2bNav } from "@/lib/b2bNav";
import { useStore } from "@/lib/store";

const paymentOptions = ["Advance", "Part-advance + Credit", "Full Credit"];

export default function BillingPage() {
  const { state, auth, notify } = useStore();
  const buyer = state.businessBuyers.find((b) => b.id === auth?.buyerId);
  const [paymentMode, setPaymentMode] = useState("Part-advance + Credit");
  const [consolidated, setConsolidated] = useState(true);

  const pct = buyer?.creditLimit ? Math.round((buyer.utilized / buyer.creditLimit) * 100) : 0;

  return (
    <DashboardShell
      title="Credit, Payments & Invoicing"
      roleLabel="Business Buyer · Accountant"
      accent="var(--color-jade)"
      nav={b2bNav}
      activeHref="/b2b/billing"
      requireRole="b2b"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Credit Limit" value={`₹${((buyer?.creditLimit || 0) / 100000).toFixed(1)}L`} tone="jade" />
        <StatCard label="Utilized" value={`₹${((buyer?.utilized || 0) / 100000).toFixed(1)}L`} sub={`${pct}% of limit`} />
        <StatCard label="Payment Terms" value={buyer?.terms || "—"} sub="Subject to Admin approval" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SectionCard icon={CreditCard} accent="jade" title="Flexible payment terms" description="Choose advance payment, part-advance + credit, or full credit under Net 15/30/45/60 terms.">
          <div className="flex flex-wrap gap-2 text-xs">
            {paymentOptions.map((t) => (
              <button
                key={t}
                onClick={() => { setPaymentMode(t); notify(`Payment mode set to ${t}`); }}
                className="rounded-full border px-3 py-1.5"
                style={{
                  borderColor: paymentMode === t ? "var(--color-jade)" : "var(--color-line)",
                  background: paymentMode === t ? "var(--color-jade-dim)" : "transparent",
                  color: "var(--color-ink)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </SectionCard>
        <SectionCard icon={FileText} accent="jade" title="Consolidated / periodic billing" description="Receive a single consolidated invoice for multiple orders placed within a billing cycle, instead of per-order billing.">
          <label className="flex items-center gap-2 text-xs text-ink">
            <input type="checkbox" checked={consolidated} onChange={(e) => setConsolidated(e.target.checked)} className="h-4 w-4" /> Enable monthly consolidated invoicing
          </label>
        </SectionCard>
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">GST tax invoices</h2>
      <p className="mt-1 text-xs text-ink-muted">Auto-generated, GST-compliant B2B tax invoices with both parties&apos; GSTIN, HSN/SAC codes, and e-invoicing / IRN generation where applicable.</p>
      <div className="mt-3">
        <DataTable
          columns={[
            { key: "id", label: "Invoice ID" },
            { key: "period", label: "Billing Period" },
            { key: "orders", label: "Orders" },
            { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Paid" ? "green" : "gold"}>{r.status}</Badge> },
          ]}
          rows={state.b2bInvoices}
        />
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">Credit notes & debit notes</h2>
      <p className="mt-1 text-xs text-ink-muted">Automated issuance for returns, shortages, or price corrections — adjustable against the next invoice.</p>
      <div className="mt-3">
        <DataTable
          columns={[
            { key: "id", label: "Note ID" },
            { key: "against", label: "Against Order" },
            { key: "reason", label: "Reason" },
            { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Adjusted" ? "green" : "rose"}>{r.status}</Badge> },
          ]}
          rows={state.creditNotes}
        />
      </div>
    </DashboardShell>
  );
}
