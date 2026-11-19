"use client";

import { useState } from "react";
import { PackageX, Plus } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, Select, TextArea, Button } from "@/components/Field";
import { accountNav } from "@/lib/accountNav";
import { useStore } from "@/lib/store";

const REASONS = [
  "Item damaged / defective",
  "Wrong item delivered",
  "Not as described",
  "Size/fit issue",
  "No longer needed",
];

function statusTone(status) {
  if (status === "Refunded") return "green";
  if (status === "Rejected") return "rose";
  if (status === "Approved" || status === "PickupScheduled") return "gold";
  return "ink";
}

export default function ReturnsPage() {
  const { state, auth, requestReturn } = useStore();
  // BUGFIX: match on the order's stable userId (persisted at checkout) with
  // a fallback to the old name-match only for legacy orders placed before
  // this fix, so historical orders don't vanish, and so a profile rename or
  // a same-named account never mixes up whose orders/returns these are.
  const myOrders = state.orders.filter(
    (o) => (o.userId ? o.userId === auth?.id : o.customer === auth?.name) && o.trackingStatus === "Delivered"
  );
  const myReturns = state.returns.filter((r) => r.userId === auth?.id);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ orderId: "", reason: REASONS[0], notes: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.orderId) return;
    await requestReturn({ orderId: form.orderId, reason: `${form.reason}${form.notes ? ` — ${form.notes}` : ""}` });
    setForm({ orderId: "", reason: REASONS[0], notes: "" });
    setOpen(false);
  };

  return (
    <DashboardShell
      title="Returns & Refunds"
      roleLabel="My Account"
      accent="var(--color-gold)"
      nav={accountNav}
      activeHref="/account/returns"
      requireRole="customer"
    >
      <div className="mb-4 flex justify-end">
        <Button variant="gold" onClick={() => setOpen(true)} disabled={myOrders.length === 0}>
          <Plus size={15} /> Request a return
        </Button>
      </div>

      {myReturns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-12 text-center">
          <PackageX className="mx-auto text-ink-muted" size={22} />
          <p className="mt-2 font-display text-base font-semibold text-ink">No return requests</p>
          <p className="mt-1 text-sm text-ink-muted">
            {myOrders.length === 0
              ? "Once an order is delivered, you can request a return from here."
              : "Use \"Request a return\" on any delivered order that needs one."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myReturns.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-paper-raised p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-ink">{r.orderId}</p>
                  <p className="text-xs text-ink-muted">{r.reason}</p>
                </div>
                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              </div>
              {r.status === "Refunded" && r.refundAmount != null && (
                <p className="mt-2 text-xs" style={{ color: "var(--color-jade)" }}>
                  ₹{r.refundAmount.toLocaleString("en-IN")} refunded {r.refundMethod === "wallet" ? "to wallet" : "to source account"}
                </p>
              )}
              {r.adminNote && <p className="mt-2 text-xs text-ink-muted">Note: {r.adminNote}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Request a return">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Order" required>
            <Select required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
              <option value="">Select a delivered order</option>
              {myOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — ₹{o.amount.toLocaleString("en-IN")} ({o.vendor})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Reason" required>
            <Select required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Additional details" hint="Optional — helps the vendor process it faster">
            <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <Button type="submit" className="w-full">Submit return request</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
