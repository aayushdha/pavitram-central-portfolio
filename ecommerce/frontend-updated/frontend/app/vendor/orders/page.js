"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Package } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, Input, Button } from "@/components/Field";
import { vendorNav } from "@/lib/vendorNav";
import { useStore } from "@/lib/store";

// The delivery timeline every order moves through once the vendor starts
// acting on it. "Order Placed" is set automatically by the backend when the
// customer checks out — everything after that is a vendor action.
const TRACKING_STAGES = ["Order Placed", "Confirmed by Vendor", "Packed", "Shipped", "Out for Delivery", "Delivered"];

function nextStage(current) {
  const i = TRACKING_STAGES.indexOf(current);
  return i >= 0 && i < TRACKING_STAGES.length - 1 ? TRACKING_STAGES[i + 1] : null;
}

export default function VendorOrdersPage() {
  const { state, auth, advanceOrderTracking } = useStore();
  const vendor = state.vendors.find((v) => v.id === auth?.vendorId);
  const myOrders = state.orders.filter((o) => (o.vendorId ? o.vendorId === auth?.vendorId : o.vendor === vendor?.name));
  const [expanded, setExpanded] = useState(null);
  const [confirmFor, setConfirmFor] = useState(null); // order being confirmed — asks for delivery date
  const [deliveryDate, setDeliveryDate] = useState("");

  const openConfirm = (o) => {
    setDeliveryDate(o.deliveryDate || "");
    setConfirmFor(o);
  };

  const submitConfirm = (e) => {
    e.preventDefault();
    advanceOrderTracking(confirmFor.id, { status: "Confirmed by Vendor", deliveryDate, note: `Expected delivery: ${deliveryDate}` });
    setConfirmFor(null);
  };

  const advance = (o) => {
    const next = nextStage(o.trackingStatus || "Order Placed");
    if (!next) return;
    advanceOrderTracking(o.id, { status: next });
  };

  const cancel = (o) => {
    if (confirm(`Cancel order ${o.id}? Customer ko turant notify ho jayega.`)) {
      advanceOrderTracking(o.id, { status: "Cancelled", note: "Cancelled by vendor" });
    }
  };

  return (
    <DashboardShell
      title="Order Processing"
      roleLabel="Vendor Portal"
      accent="var(--color-gold)"
      nav={vendorNav}
      activeHref="/vendor/orders"
      requireRole="vendor"
    >
      <div className="mb-5 rounded-2xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
        Naya order aane par pehle isse <b>Confirm</b> karke expected delivery date do — tabhi customer ko tracking dikhna shuru hogi. Uske baad Packed → Shipped → Out for Delivery → Delivered, ek-ek stage aage badhate jao.
      </div>

      {myOrders.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">
          No orders placed against your store yet.
        </p>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o) => {
            const stage = o.trackingStatus || "Order Placed";
            const isOpen = expanded === o.id;
            const next = nextStage(stage);
            const isCancelled = stage === "Cancelled";
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
                <button
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-muted">{o.id}</span>
                    <Badge tone={o.type === "B2B" ? "jade" : "gold"}>{o.type}</Badge>
                    <span className="text-sm text-ink">{o.customer}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">₹{o.amount.toLocaleString("en-IN")}</span>
                    <Badge tone={isCancelled ? "rose" : stage === "Delivered" ? "jade" : "gold"}>{stage}</Badge>
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          <Package size={13} /> Items
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-ink">
                          {(o.items || []).length > 0 ? (
                            o.items.map((it, i) => (
                              <li key={i} className="flex justify-between">
                                <span>{it.product} × {it.qty}</span>
                                <span className="font-mono text-ink-muted">₹{(it.price * it.qty).toLocaleString("en-IN")}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-ink-muted">Item details not recorded for this order.</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          <MapPin size={13} /> Deliver to
                        </p>
                        {o.address ? (
                          <div className="mt-2 text-sm text-ink">
                            <p className="font-medium">{o.address.fullName || o.customer}</p>
                            <p className="text-ink-muted">{[o.address.line1, o.address.line2, o.address.landmark].filter(Boolean).join(", ")}</p>
                            <p className="text-ink-muted">{[o.address.city, o.address.state, o.address.pincode].filter(Boolean).join(", ")}</p>
                            {o.address.phone && <p className="text-ink-muted">📞 {o.address.phone}</p>}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-ink-muted">Address not recorded for this order.</p>
                        )}
                        {o.deliveryDate && (
                          <p className="mt-2 text-sm font-semibold" style={{ color: "var(--color-jade)" }}>
                            Expected delivery: {o.deliveryDate}
                          </p>
                        )}
                      </div>
                    </div>

                    {Array.isArray(o.trackingHistory) && o.trackingHistory.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Tracking timeline</p>
                        <div className="mt-2 space-y-1.5 text-xs text-ink-muted">
                          {o.trackingHistory.map((ev, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-gold)" }} />
                              <span className="font-semibold text-ink">{ev.status}</span>
                              <span>{ev.note ? `— ${ev.note}` : ""}</span>
                              <span className="ml-auto">{ev.at ? new Date(ev.at).toLocaleString("en-IN") : ""}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isCancelled && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {stage === "Order Placed" && (
                          <Button variant="gold" onClick={() => openConfirm(o)}>Confirm order + set delivery date</Button>
                        )}
                        {stage !== "Order Placed" && next && (
                          <Button onClick={() => advance(o)}>Mark as "{next}"</Button>
                        )}
                        <Button variant="ghost" style={{ color: "var(--color-rose)" }} onClick={() => cancel(o)}>Cancel order</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!confirmFor} onClose={() => setConfirmFor(null)} title={`Confirm order ${confirmFor?.id || ""}`}>
        <form onSubmit={submitConfirm} className="space-y-4">
          <p className="text-sm text-ink-muted">Confirm karte hi customer ko notify ho jayega aur unki tracking page par ye date dikhegi.</p>
          <Field label="Expected delivery date" required>
            <Input required type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          </Field>
          <Button type="submit" variant="gold" className="w-full">Confirm & notify customer</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
