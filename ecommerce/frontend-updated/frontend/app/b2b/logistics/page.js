"use client";

import { useState } from "react";
import { Warehouse, PackageSearch, RotateCcw, Plus, Trash2 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import SectionCard from "@/components/SectionCard";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, Input, Button } from "@/components/Field";
import { b2bNav } from "@/lib/b2bNav";
import { useStore } from "@/lib/store";

export default function LogisticsPage() {
  const { state, savedAddresses, notify } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: "", pincode: "" });

  const addAddress = (e) => {
    e.preventDefault();
    savedAddresses.add({ label: form.label, pincode: form.pincode, isDefault: state.savedAddresses.length === 0 }, { message: "Address added" });
    setForm({ label: "", pincode: "" });
    setOpen(false);
  };

  const removeAddress = (id) => savedAddresses.remove(id, { message: "Address removed" });

  return (
    <DashboardShell
      title="Logistics & Fulfillment"
      roleLabel="Business Buyer · Purchase Manager"
      accent="var(--color-jade)"
      nav={b2bNav}
      activeHref="/b2b/logistics"
      requireRole="b2b"
    >
      <SectionCard icon={Warehouse} accent="jade" title="Multi-branch shipping addresses" description="Maintain and select from multiple warehouse/branch delivery addresses at checkout.">
        <div className="grid gap-3 sm:grid-cols-3">
          {state.savedAddresses.map((a) => (
            <div key={a.id} className="rounded-xl border border-line p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">{a.label}</p>
                <div className="flex items-center gap-2">
                  {a.isDefault && <Badge tone="jade">Default</Badge>}
                  <button onClick={() => removeAddress(a.id)} style={{ color: "var(--color-rose)" }}><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="mt-1 text-xs text-ink-muted">Pincode {a.pincode}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-jade)" }}>
          <Plus size={13} /> Add branch address
        </button>
      </SectionCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SectionCard icon={PackageSearch} accent="jade" title="Partial & staggered shipments" description="Track and receive large orders in multiple batches when full quantity can't be dispatched at once.">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
              <span className="text-ink">PVT-10232 — Batch 1 of 3</span>
              <Badge tone="green">Delivered</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
              <span className="text-ink">PVT-10232 — Batch 2 of 3</span>
              <Badge tone="gold">In Transit</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
              <span className="text-ink">PVT-10232 — Batch 3 of 3</span>
              <Badge tone="ink">Pending Dispatch</Badge>
            </div>
          </div>
        </SectionCard>
        <SectionCard icon={RotateCcw} accent="jade" title="Bulk return / RMA management" description="Raise Return Merchandise Authorization requests for bulk quantities, with quality-rejection evidence upload.">
          <Button onClick={() => notify("RMA request raised — vendor notified for evidence review")} className="w-full" style={{ background: "var(--color-jade)" }}>
            Raise a bulk RMA request
          </Button>
        </SectionCard>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add branch address">
        <form onSubmit={addAddress} className="space-y-4">
          <Field label="Label" required><Input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Pune Distribution Branch" /></Field>
          <Field label="Pincode" required><Input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="411057" /></Field>
          <Button type="submit" className="w-full">Save address</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
