"use client";

import { useState } from "react";
import { Layers, FileSignature, Beaker, HandCoins, Trash2, Plus } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import SectionCard from "@/components/SectionCard";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, Input, Select, Button } from "@/components/Field";
import { vendorNav } from "@/lib/vendorNav";
import { useStore } from "@/lib/store";

const sampleStatuses = ["Requested", "Dispatched", "Delivered"];
const creditTermOptions = ["20% Advance + Net 30", "Net 15", "Net 30", "Net 45", "Full Advance"];

export default function B2BToolkitPage() {
  const { state, auth, contractPricing, sampleOrders, setState, notify } = useStore();
  const myProducts = state.products.filter((p) => p.vendorId === auth?.vendorId && p.channels.includes("b2b"));
  const tiered = myProducts[0];
  // BUGFIX (cross-tenant leak): both lists below used to render
  // state.contractPricing / state.sampleOrders directly — every vendor's
  // negotiated rate cards and sample-order requests, all mixed together
  // with no vendor scoping. New rate cards also never carried a vendorId.
  const myContractPricing = state.contractPricing.filter((c) => c.vendorId === auth?.vendorId);
  const mySampleOrders = state.sampleOrders.filter((s) => s.vendorId === auth?.vendorId);

  const [rateModal, setRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({ buyer: "", product: "", rate: "", validity: "" });
  const [selectedTerms, setSelectedTerms] = useState(["Net 30"]);

  const addRateCard = (e) => {
    e.preventDefault();
    contractPricing.add({ ...rateForm, vendorId: auth?.vendorId }, { message: "Contract rate card added" });
    setRateForm({ buyer: "", product: "", rate: "", validity: "" });
    setRateModal(false);
  };

  const removeRateCard = (id) => contractPricing.remove(id, { message: "Rate card removed" });

  const cycleSampleStatus = (s) => {
    const idx = sampleStatuses.indexOf(s.status);
    const next = sampleStatuses[(idx + 1) % sampleStatuses.length];
    sampleOrders.update(s.id, { status: next }, { message: `Sample ${s.id} → ${next}` });
  };

  const toggleTerm = (t) => setSelectedTerms((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const saveTerms = () => notify("Credit terms proposal saved — pending Admin credit-limit approval");

  return (
    <DashboardShell
      title="B2B Selling Toolkit"
      roleLabel="Vendor"
      accent="var(--color-gold)"
      nav={vendorNav}
      activeHref="/vendor/b2b-toolkit"
      requireRole="vendor"
    >
      <SectionCard icon={Layers} title="Tiered / volume pricing" description="Quantity-based price breaks, set per product from the Catalog & Inventory page.">
        {tiered ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {tiered.tierPricing.map((t) => (
                <div key={t.min} className="rounded-xl border border-line p-3 text-center">
                  <p className="text-xs text-ink-muted">{t.min}–{t.max ?? "∞"} units</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-ink">₹{t.price}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-muted">Shown for <span className="font-semibold text-ink">{tiered.name}</span> · MOQ <span className="font-semibold text-ink">{tiered.moq} units</span>. Edit in Catalog & Inventory.</p>
          </>
        ) : (
          <p className="text-xs text-ink-muted">List a B2B-enabled product in Catalog & Inventory to configure tiered pricing.</p>
        )}
      </SectionCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SectionCard icon={FileSignature} title="Customer-specific / contract pricing" description="Negotiate and lock a special rate card for a specific business buyer or segment, valid for a defined period.">
          <div className="space-y-2">
            {myContractPricing.length === 0 && <p className="text-xs text-ink-muted">No rate cards yet.</p>}
            {myContractPricing.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs">
                <div>
                  <p className="font-medium text-ink">{c.buyer}</p>
                  <p className="text-ink-muted">{c.product} · {c.rate} · {c.validity}</p>
                </div>
                <button onClick={() => removeRateCard(c.id)} style={{ color: "var(--color-rose)" }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setRateModal(true)} className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
            <Plus size={13} /> Negotiate new rate card
          </button>
        </SectionCard>

        <SectionCard icon={HandCoins} title="Credit terms configuration" description="Propose payment terms (advance %, Net 15/30/45/60) per business buyer, subject to Admin credit-limit approval.">
          <div className="flex flex-wrap gap-2 text-xs">
            {creditTermOptions.map((t) => (
              <button
                key={t}
                onClick={() => toggleTerm(t)}
                className="rounded-full border px-3 py-1.5"
                style={{
                  borderColor: selectedTerms.includes(t) ? "var(--color-gold)" : "var(--color-line)",
                  background: selectedTerms.includes(t) ? "var(--color-gold-dim)" : "transparent",
                  color: "var(--color-ink)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <Button onClick={saveTerms} variant="gold" className="mt-3">Save proposed terms</Button>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard icon={Beaker} title="Sample order handling" description="Support low-quantity 'sample before bulk order' requests. Click a row's status to advance it.">
          <DataTable
            columns={[
              { key: "id", label: "Sample ID" },
              { key: "buyer", label: "Buyer" },
              { key: "product", label: "Product" },
              { key: "qty", label: "Qty" },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <button onClick={() => cycleSampleStatus(r)}>
                    <Badge tone={r.status === "Delivered" ? "green" : r.status === "Dispatched" ? "jade" : "gold"}>{r.status}</Badge>
                  </button>
                ),
              },
            ]}
            rows={mySampleOrders}
          />
        </SectionCard>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-5">
        <h3 className="font-display text-sm font-semibold text-ink">RFQ Inbox & quotation builder</h3>
        <p className="mt-1 text-xs text-ink-muted">Respond to buyer RFQs with itemized quotations including price, lead time, and validity date.</p>
        <a href="/vendor/rfq" className="mt-3 inline-block text-xs font-semibold" style={{ color: "var(--color-gold)" }}>Go to RFQ Inbox →</a>
      </div>

      <Modal open={rateModal} onClose={() => setRateModal(false)} title="Negotiate new rate card">
        <form onSubmit={addRateCard} className="space-y-4">
          <Field label="Business buyer" required><Input required value={rateForm.buyer} onChange={(e) => setRateForm({ ...rateForm, buyer: e.target.value })} /></Field>
          <Field label="Product" required><Input required value={rateForm.product} onChange={(e) => setRateForm({ ...rateForm, product: e.target.value })} /></Field>
          <Field label="Negotiated rate" required><Input required value={rateForm.rate} onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })} placeholder="₹1,120/unit" /></Field>
          <Field label="Validity" required><Input required value={rateForm.validity} onChange={(e) => setRateForm({ ...rateForm, validity: e.target.value })} placeholder="Till 31 Mar 2027" /></Field>
          <Button type="submit" className="w-full">Save rate card</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
