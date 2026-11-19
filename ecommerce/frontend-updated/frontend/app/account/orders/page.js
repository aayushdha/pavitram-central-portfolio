"use client";

import { useState } from "react";
import { AlertTriangle, Check, Circle, MapPin, Package } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, Select, TextArea, Button } from "@/components/Field";
import { accountNav } from "@/lib/accountNav";
import { useStore } from "@/lib/store";

// Same delivery timeline the vendor advances from /vendor/orders — this page
// just renders it read-only for the customer. "Order Placed" happens
// automatically at checkout; every stage after that is set by the vendor
// confirming/packing/shipping the order.
const TRACKING_STAGES = ["Order Placed", "Confirmed by Vendor", "Packed", "Shipped", "Out for Delivery", "Delivered"];

// BUGFIX: there was no way anywhere on the site for a customer to actually
// raise a dispute — admin could only manage disputes that already existed,
// but nothing ever created one. Added here as a small form on the order
// detail view, matching the guide's "every dispute raised by a customer,
// business buyer, or vendor" (Section 4.5).
const DISPUTE_TYPES = [
  { value: "defective", label: "Item arrived defective/damaged" },
  { value: "quality_rejection", label: "Quality doesn't match listing" },
  { value: "partial_shortage", label: "Partial shipment / items missing" },
  { value: "non_delivery", label: "Never delivered" },
  { value: "other", label: "Other" },
];

export default function MyOrdersPage() {
  const { state, auth, disputes, notify } = useStore();
  const myOrders = state.orders.filter((o) => (o.userId ? o.userId === auth?.id : o.customer === auth?.name));
  const [selected, setSelected] = useState(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeForm, setDisputeForm] = useState({ type: "defective", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const stage = selected?.trackingStatus || "Order Placed";
  const isCancelled = stage === "Cancelled";
  const currentIdx = TRACKING_STAGES.indexOf(stage);

  const myDisputesForSelected = selected
    ? state.disputes.filter((d) => d.orderId === selected.id && (d.raisedByUserId ? d.raisedByUserId === auth?.id : true))
    : [];

  const submitDispute = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await disputes.add(
        {
          orderId: selected.id,
          raisedBy: "customer",
          raisedByUserId: auth?.id,
          against: selected.vendor,
          type: disputeForm.type,
          description: disputeForm.description,
        },
        { message: "Dispute submitted — our team will review it" }
      );
      setDisputeOpen(false);
      setDisputeForm({ type: "defective", description: "" });
    } catch (e) {
      notify(e.message || "Could not submit dispute", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="My Orders"
      roleLabel="My Account"
      accent="var(--color-gold)"
      nav={accountNav}
      activeHref="/account/orders"
      requireRole="customer"
    >
      {myOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-12 text-center">
          <p className="font-display text-base font-semibold text-ink">No orders yet</p>
          <p className="mt-1 text-sm text-ink-muted">Everything you buy will show up here with live tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className="flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-paper-raised px-5 py-4 text-left transition-colors hover:border-[var(--color-gold)]"
            >
              <div>
                <p className="font-mono text-sm font-semibold text-ink">{o.id}</p>
                <p className="text-xs text-ink-muted">{o.vendor} · {o.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-ink">₹{o.amount.toLocaleString("en-IN")}</span>
                <Badge tone={o.trackingStatus === "Cancelled" ? "rose" : o.trackingStatus === "Delivered" ? "green" : "gold"}>
                  {o.trackingStatus || "Order Placed"}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setDisputeOpen(false);
        }}
        title={selected?.id}
        subtitle={selected ? `${selected.vendor} · ₹${selected.amount.toLocaleString("en-IN")}` : ""}
      >
        {selected && (
          <div>
            {selected.deliveryDate && !isCancelled && (
              <p className="mb-4 rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: "var(--color-jade-dim)", color: "var(--color-jade)" }}>
                Expected delivery: {selected.deliveryDate}
              </p>
            )}
            {isCancelled ? (
              <p className="mb-4 rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: "#f6e2dd", color: "var(--color-rose)" }}>
                This order was cancelled.
              </p>
            ) : (
              <div className="space-y-0">
                {TRACKING_STAGES.map((s, i) => {
                  const done = i <= currentIdx;
                  return (
                    <div key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
                          style={{ background: done ? "var(--color-jade)" : "var(--color-line)", color: "#fff" }}
                        >
                          {done ? <Check size={13} /> : <Circle size={8} fill="currentColor" />}
                        </span>
                        {i < TRACKING_STAGES.length - 1 && (
                          <span className="h-8 w-0.5" style={{ background: done && i < currentIdx ? "var(--color-jade)" : "var(--color-line)" }} />
                        )}
                      </div>
                      <p className={`pb-6 text-sm ${done ? "font-medium text-ink" : "text-ink-muted"}`}>{s}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {selected.address && (
              <div className="border-t border-line pt-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <MapPin size={13} /> Delivering to
                </p>
                <div className="mt-2 text-sm text-ink">
                  <p className="font-medium">{selected.address.fullName}</p>
                  <p className="text-ink-muted">{[selected.address.line1, selected.address.line2, selected.address.landmark].filter(Boolean).join(", ")}</p>
                  <p className="text-ink-muted">{[selected.address.city, selected.address.state, selected.address.pincode].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            )}

            {selected.items && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <Package size={13} /> Items
                </p>
                <div className="mt-2 space-y-1.5 text-sm">
                  {selected.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-ink">{it.product} × {it.qty}</span>
                      <span className="font-mono text-ink-muted">₹{(it.price * it.qty).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-line pt-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <AlertTriangle size={13} /> Issue with this order?
              </p>
              {myDisputesForSelected.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {myDisputesForSelected.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs">
                      <span className="text-ink">{DISPUTE_TYPES.find((t) => t.value === d.type)?.label || d.type}</span>
                      <Badge tone={d.stage === "Closed" || d.stage === "Refund Approved" ? "green" : d.stage === "Rejected" ? "rose" : "gold"}>
                        {d.stage}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              {disputeOpen ? (
                <form onSubmit={submitDispute} className="mt-2 space-y-2">
                  <Field label="What went wrong?">
                    <Select value={disputeForm.type} onChange={(e) => setDisputeForm((f) => ({ ...f, type: e.target.value }))}>
                      {DISPUTE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Details (optional)">
                    <TextArea
                      rows={2}
                      value={disputeForm.description}
                      onChange={(e) => setDisputeForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Tell us what happened…"
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit dispute"}</Button>
                    <button type="button" onClick={() => setDisputeOpen(false)} className="text-xs font-semibold text-ink-muted">Cancel</button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setDisputeOpen(true)}
                  className="mt-2 rounded-full border px-4 py-2 text-xs font-semibold"
                  style={{ borderColor: "var(--color-rose)", color: "var(--color-rose)" }}
                >
                  Raise a dispute
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
