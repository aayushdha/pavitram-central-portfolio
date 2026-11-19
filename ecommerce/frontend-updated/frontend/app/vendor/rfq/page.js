"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { Field, Input, Button } from "@/components/Field";
import { vendorNav } from "@/lib/vendorNav";
import { useStore } from "@/lib/store";

export default function VendorRFQPage() {
  const { state, auth, rfqs } = useStore();
  // BUGFIX (critical cross-vendor data leak): this page used to render
  // `state.rfqs` directly — literally every RFQ from every business buyer,
  // for every vendor's products, shown to and "respond"-able by any vendor
  // who happened to log in. RFQs now carry a vendorId (routed from the
  // requested product's own vendor); scope the inbox to just this vendor.
  const myRfqs = state.rfqs.filter((r) => r.vendorId === auth?.vendorId);
  const [selected, setSelected] = useState(myRfqs[0]?.id || null);
  const [quote, setQuote] = useState({ price: "", leadTime: "", validUntil: "" });

  const activeRfq = myRfqs.find((r) => r.id === selected);

  const sendQuotation = (e) => {
    e.preventDefault();
    rfqs.update(
      selected,
      { status: "Quotation Sent", quotedPrice: quote.price, leadTime: quote.leadTime, validUntil: quote.validUntil },
      { message: `Quotation sent for ${selected}`, log: `Sent quotation for ${selected} at ₹${quote.price}/unit` }
    );
    setQuote({ price: "", leadTime: "", validUntil: "" });
  };

  return (
    <DashboardShell
      title="RFQ Inbox"
      roleLabel="Vendor Portal"
      accent="var(--color-gold)"
      nav={vendorNav}
      activeHref="/vendor/rfq"
      requireRole="vendor"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <DataTable
            columns={[
              { key: "id", label: "RFQ ID" },
              { key: "buyer", label: "Business Buyer" },
              { key: "product", label: "Product" },
              { key: "qty", label: "Quantity" },
              { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Quotation Sent" ? "jade" : "gold"}>{r.status}</Badge> },
              {
                key: "actions",
                label: "",
                render: (r) => (
                  <button onClick={() => setSelected(r.id)} className="text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
                    Respond
                  </button>
                ),
              },
            ]}
            rows={myRfqs}
          />
        </div>

        <div className="h-fit rounded-2xl border border-line bg-paper-raised p-5">
          <h3 className="font-display text-base font-semibold text-ink">Build a quotation</h3>
          {activeRfq ? (
            <>
              <p className="mt-1 text-xs text-ink-muted">
                Respond to {activeRfq.id} from {activeRfq.buyer} — {activeRfq.product} ({activeRfq.qty})
              </p>
              <form onSubmit={sendQuotation} className="mt-4 space-y-4">
                <Field label="Quoted price / unit" required>
                  <Input type="number" required value={quote.price} onChange={(e) => setQuote({ ...quote, price: e.target.value })} placeholder="e.g. 219" />
                </Field>
                <Field label="Lead time (days)" required>
                  <Input type="number" required value={quote.leadTime} onChange={(e) => setQuote({ ...quote, leadTime: e.target.value })} placeholder="e.g. 5" />
                </Field>
                <Field label="Quotation valid until" required>
                  <Input type="date" required value={quote.validUntil} onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })} />
                </Field>
                <Button type="submit" variant="gold" className="w-full">Send Quotation</Button>
              </form>
            </>
          ) : (
            <p className="mt-2 text-xs text-ink-muted">Select an RFQ from the list to respond.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
