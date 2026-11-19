"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, TextArea, Button } from "@/components/Field";
import { vendorNav } from "@/lib/vendorNav";
import { useStore } from "@/lib/store";

export default function VendorEarningsPage() {
  const { state, auth, setState, notify } = useStore();
  const vendor = state.vendors.find((v) => v.id === auth?.vendorId);
  const myOrders = state.orders.filter((o) => (o.vendorId ? o.vendorId === auth?.vendorId : o.vendor === vendor?.name));
  const b2cSales = myOrders.filter((o) => o.type === "B2C").reduce((s, o) => s + o.amount, 0);
  const b2bSales = myOrders.filter((o) => o.type === "B2B").reduce((s, o) => s + o.amount, 0);
  // BUGFIX: this used to be a hardcoded flat 10% of sales for every vendor,
  // completely ignoring the admin's actual Commission Rules (per-product,
  // per-vendor, per-category, global, flat-vs-percent, B2B volume slabs).
  // Orders now carry a real `commission` computed by that engine at
  // checkout time — sum it directly. Falls back to 0 for legacy orders
  // placed before this fix (rather than guessing with the old flat rate).
  const commission = Math.round(myOrders.reduce((s, o) => s + (o.commission || 0), 0));
  const netBalance = b2cSales + b2bSales - commission;

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");

  const requestWithdraw = () => {
    notify(`Withdrawal of ₹${netBalance.toLocaleString("en-IN")} requested — processed in 2-3 business days`);
    setWithdrawOpen(false);
  };

  const sendReply = (e) => {
    e.preventDefault();
    setState((s) => ({
      ...s,
      vendorReviews: s.vendorReviews.map((r) => (r.from === replyModal.from ? { ...r, reply: replyText } : r)),
    }));
    notify("Reply posted");
    setReplyModal(null);
    setReplyText("");
  };

  return (
    <DashboardShell
      title="Earnings & Receivables"
      roleLabel="Vendor Portal"
      accent="var(--color-gold)"
      nav={vendorNav}
      activeHref="/vendor/earnings"
      requireRole="vendor"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sales (B2C)" value={`₹${b2cSales.toLocaleString("en-IN")}`} tone="gold" />
        <StatCard label="Total Sales (B2B)" value={`₹${b2bSales.toLocaleString("en-IN")}`} tone="jade" />
        <StatCard label="Commission Deducted" value={`₹${commission.toLocaleString("en-IN")}`} />
        <StatCard label="Net Balance Available" value={`₹${netBalance.toLocaleString("en-IN")}`} tone="gold" />
      </div>
      <Button onClick={() => setWithdrawOpen(true)} variant="gold" className="mt-4">Request withdrawal</Button>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Receivables from Business Buyers</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Outstanding amounts for orders sold on credit terms.
        </p>
        <div className="mt-3">
          <DataTable
            columns={[
              { key: "company", label: "Business Buyer" },
              { key: "terms", label: "Terms" },
              { key: "creditLimit", label: "Credit Limit", render: (r) => `₹${r.creditLimit.toLocaleString("en-IN")}` },
              { key: "utilized", label: "Amount Invoiced", render: (r) => `₹${r.utilized.toLocaleString("en-IN")}` },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <Badge tone={r.status === "Approved" ? "jade" : r.status === "On Hold" ? "rose" : "gold"}>
                    {r.status}
                  </Badge>
                ),
              },
            ]}
            rows={state.businessBuyers}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Review moderation</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Customer feedback and structured B2B ratings (on-time delivery, quality, responsiveness).
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {state.vendorReviews.map((r) => (
            <div key={r.from} className="rounded-2xl border border-line bg-paper-raised p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{r.from}</p>
                <Badge tone={r.type === "B2C" ? "gold" : "jade"}>{r.type}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1"><Star size={12} style={{ color: "var(--color-gold)" }} /> On-time {r.onTime}</span>
                <span className="flex items-center gap-1"><Star size={12} style={{ color: "var(--color-gold)" }} /> Quality {r.quality}</span>
                <span className="flex items-center gap-1"><Star size={12} style={{ color: "var(--color-gold)" }} /> Response {r.responsiveness}</span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">&ldquo;{r.note}&rdquo;</p>
              {r.reply && <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-xs text-ink"><span className="font-semibold">Your reply: </span>{r.reply}</p>}
              <button onClick={() => { setReplyModal(r); setReplyText(r.reply || ""); }} className="mt-2 text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
                {r.reply ? "Edit reply" : "Reply"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Request withdrawal">
        <p className="text-sm text-ink-muted">
          Available balance: <span className="font-semibold text-ink">₹{netBalance.toLocaleString("en-IN")}</span>
        </p>
        <Button onClick={requestWithdraw} variant="gold" className="mt-4 w-full">Confirm withdrawal request</Button>
      </Modal>

      <Modal open={!!replyModal} onClose={() => setReplyModal(null)} title={`Reply to ${replyModal?.from || ""}`}>
        <form onSubmit={sendReply} className="space-y-4">
          <Field label="Your reply">
            <TextArea required value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} />
          </Field>
          <Button type="submit" className="w-full">Post reply</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
