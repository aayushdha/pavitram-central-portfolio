"use client";

import { useState } from "react";
import { Upload, FileCheck, RefreshCw } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import SectionCard from "@/components/SectionCard";
import { Field, Input, Select, TextArea, Button } from "@/components/Field";
import { b2bNav } from "@/lib/b2bNav";
import { useStore } from "@/lib/store";

export default function RFQPage() {
  const { state, auth, rfqs, notify } = useStore();
  const buyer = state.businessBuyers.find((b) => b.id === auth?.buyerId);
  // BUGFIX: matched by company display name before — a company rename would
  // make historical RFQs vanish from this list. Prefer the stable buyerId.
  const myRfqs = state.rfqs.filter((r) => (r.buyerId ? r.buyerId === buyer?.id : r.buyer === buyer?.company));
  const bulkProducts = state.products.filter((p) => p.channels.includes("b2b"));

  const [form, setForm] = useState({ product: bulkProducts[0]?.name || "", qty: "", date: "", notes: "" });

  const submitRfq = (e) => {
    e.preventDefault();
    // BUGFIX: RFQ now carries buyerId (for the fix above) and vendorId,
    // routed from the chosen product's own vendor — previously an RFQ had
    // no vendor link at all, so EVERY vendor's RFQ inbox showed EVERY
    // buyer's RFQs for EVERY product, regardless of who it was meant for.
    const selectedProduct = bulkProducts.find((p) => p.name === form.product);
    rfqs.add(
      {
        buyer: buyer?.company || "Unknown buyer",
        buyerId: buyer?.id || undefined,
        vendorId: selectedProduct?.vendorId || undefined,
        product: form.product,
        qty: `${form.qty} units`,
        status: "Awaiting Vendor Response",
        raised: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        notes: form.notes,
        targetDate: form.date,
      },
      { message: "RFQ sent to matching vendors", log: `${buyer?.company} raised an RFQ for ${form.qty} units of ${form.product}` }
    );
    setForm({ product: bulkProducts[0]?.name || "", qty: "", date: "", notes: "" });
  };

  return (
    <DashboardShell
      title="RFQs & Bulk Ordering"
      roleLabel="Business Buyer · Purchase Manager"
      accent="var(--color-jade)"
      nav={b2bNav}
      activeHref="/b2b/rfq"
      requireRole="b2b"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Your RFQs</h2>
          <div className="mt-3">
            {myRfqs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">No RFQs raised yet — use the form to send one.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "RFQ ID" },
                  { key: "product", label: "Product" },
                  { key: "qty", label: "Quantity" },
                  { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Quotation Sent" ? "jade" : "gold"}>{r.status}</Badge> },
                  { key: "raised", label: "Raised" },
                ]}
                rows={myRfqs}
              />
            )}
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink">Bulk ordering tools</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <SectionCard icon={Upload} accent="jade" title="Bulk order upload" description="Upload a CSV/Excel of SKUs and quantities — validated against live price and stock instantly.">
              <button onClick={() => notify("CSV validated — 0 errors, ready to review at checkout")} className="w-full rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: "var(--color-jade)" }}>
                Upload CSV / Excel
              </button>
            </SectionCard>
            <SectionCard icon={FileCheck} accent="jade" title="Purchase Order (PO) ordering" description="Attach an internal PO number/document for procurement-compliant record keeping.">
              <button onClick={() => notify("PO reference attached to your next order")} className="w-full rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: "var(--color-jade)", color: "var(--color-jade)" }}>
                Attach PO to order
              </button>
            </SectionCard>
            <SectionCard icon={RefreshCw} accent="jade" title="Recurring / subscription orders" description="Auto-reorder schedules (weekly/monthly) for regularly consumed business supplies.">
              <button onClick={() => notify("Auto-reorder schedule created")} className="w-full rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: "var(--color-jade)", color: "var(--color-jade)" }}>
                Set up auto-reorder
              </button>
            </SectionCard>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-5">
            <h3 className="font-display text-sm font-semibold text-ink">Minimum Order Quantity enforcement</h3>
            <p className="mt-1 text-xs text-ink-muted">Cart automatically validates against vendor-defined MOQ before checkout is allowed.</p>
            <div className="mt-3 space-y-2">
              {bulkProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-xs">
                  <span className="text-ink">{p.name}</span>
                  <span className="font-medium text-ink-muted">MOQ {p.moq} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-paper-raised p-5">
          <h3 className="font-display text-base font-semibold text-ink">Raise a new RFQ</h3>
          <form onSubmit={submitRfq} className="mt-4 space-y-4">
            <Field label="Product / specification">
              <Select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
                {bulkProducts.map((p) => <option key={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Quantity required" required>
              <Input type="number" required value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 2000" />
            </Field>
            <Field label="Target delivery date">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Notes for vendors">
              <TextArea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Packaging, quality, or delivery requirements" />
            </Field>
            <Button type="submit" className="w-full" style={{ background: "var(--color-jade)" }}>Send RFQ to matching vendors</Button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
