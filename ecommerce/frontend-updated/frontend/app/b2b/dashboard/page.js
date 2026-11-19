"use client";

import Link from "next/link";
import { FileText, ArrowUpRight, Upload, Users, ReceiptText, Search } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import ProductThumb from "@/components/ProductThumb";
import { b2bNav } from "@/lib/b2bNav";
import { useStore } from "@/lib/store";

const quickActions = [
  { href: "/b2b/rfq", label: "Raise a new RFQ", icon: FileText },
  { href: "/products", label: "Browse catalog", icon: Search },
  { href: "/b2b/team", label: "Invite teammate", icon: Users },
  { href: "/b2b/billing", label: "View invoices", icon: ReceiptText },
];

const spendByCategory = [
  { label: "Textiles & Fabrics", pct: 42 },
  { label: "Packaging Supplies", pct: 26 },
  { label: "Spices & Foodgrain", pct: 18 },
  { label: "Electronics & Accessories", pct: 14 },
];

export default function B2BDashboard() {
  const { state, auth } = useStore();
  const buyer = state.businessBuyers.find((b) => b.id === auth?.buyerId);
  const b2bOrders = state.orders.filter((o) => o.customer === buyer?.company);
  const myRfqs = state.rfqs.filter((r) => r.buyer === buyer?.company);
  const creditLimit = buyer?.creditLimit || 0;
  const utilized = buyer?.utilized || 0;
  const pct = creditLimit ? Math.round((utilized / creditLimit) * 100) : 0;
  const recommended = state.products.filter((p) => p.channels.includes("b2b")).slice(0, 4);

  return (
    <DashboardShell
      title={buyer?.company || "Your business"}
      roleLabel="Business Buyer · Company Admin"
      subtitle={`Segment: ${buyer?.segment || "—"} · Status: ${buyer?.status || "—"}`}
      accent="var(--color-jade)"
      nav={b2bNav}
      activeHref="/b2b/dashboard"
      requireRole="b2b"
    >
      {buyer?.status !== "Approved" && (
        <div className="mb-5 rounded-xl border p-4 text-sm" style={{ borderColor: buyer?.status === "On Hold" ? "var(--color-rose)" : "var(--color-gold)", background: buyer?.status === "On Hold" ? "rgba(220,38,38,0.08)" : "var(--color-gold-dim)" }}>
          Your account is <span className="font-semibold">{buyer?.status}</span>. Credit limits and tiered pricing unlock once Admin approves your KYC.
          {buyer?.status === "On Hold" && buyer?.rejectionReason && (
            <div className="mt-1">Reason: {buyer.rejectionReason} — issue fix karke admin se dobara review request karein.</div>
          )}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Credit Limit" value={`₹${(creditLimit / 100000).toFixed(1)}L`} tone="jade" />
        <StatCard label="Utilized" value={`₹${(utilized / 100000).toFixed(1)}L`} sub={creditLimit ? `${pct}% of limit` : "—"} />
        <StatCard label="Available Balance" value={`₹${((creditLimit - utilized) / 100000).toFixed(1)}L`} tone="green" />
        <StatCard label="Open RFQs" value={myRfqs.length} sub="Raised by you" icon={FileText} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-[var(--color-jade)]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: "var(--color-jade-dim)" }}>
              <a.icon size={15} style={{ color: "var(--color-jade)" }} />
            </span>
            {a.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-paper-raised p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">Credit utilization · {buyer?.terms || "—"} terms</span>
          <span className="text-ink-muted">{pct}% used</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-jade)" }} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Recent Orders</h2>
          <div className="mt-3">
            {b2bOrders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">No orders yet — browse the catalog to place your first bulk order.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Order ID" },
                  { key: "vendor", label: "Vendor" },
                  { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
                  { key: "status", label: "Status", render: (r) => <Badge tone="jade">{r.status}</Badge> },
                  { key: "date", label: "Date" },
                ]}
                rows={b2bOrders}
              />
            )}
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink">Open RFQs</h2>
          <div className="mt-3">
            {myRfqs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">No RFQs raised yet.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "RFQ ID" },
                  { key: "product", label: "Product" },
                  { key: "qty", label: "Quantity" },
                  { key: "status", label: "Status", render: (r) => <Badge tone="gold">{r.status}</Badge> },
                  { key: "raised", label: "Raised" },
                ]}
                rows={myRfqs}
              />
            )}
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink">Recommended for your business</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="rounded-xl border border-line bg-paper-raised p-3 transition-colors hover:border-[var(--color-jade)]">
                <span className="block h-9 w-9 overflow-hidden rounded-md text-2xl">
                  <ProductThumb image={p.image} fill emojiSize={22} />
                </span>
                <p className="mt-2 line-clamp-2 text-xs font-medium text-ink">{p.name}</p>
                <p className="mt-1 font-mono text-xs font-semibold" style={{ color: "var(--color-jade)" }}>
                  Bulk from ₹{p.tierPricing?.at(-1)?.price?.toLocaleString("en-IN") ?? p.price.toLocaleString("en-IN")}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="h-fit space-y-5">
          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <h3 className="font-display text-base font-semibold text-ink">Your team</h3>
            <div className="mt-3 space-y-3">
              {state.teamMembers.slice(0, 3).map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-ink">{m.name}</p>
                    <p className="text-[11px] text-ink-muted">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="/b2b/team" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-jade)" }}>
              Manage team & spend rules <ArrowUpRight size={13} />
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <h3 className="font-display text-base font-semibold text-ink">Spend by category</h3>
            <div className="mt-3 space-y-3">
              {spendByCategory.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink">{c.label}</span>
                    <span className="text-ink-muted">{c.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-paper">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: "var(--color-jade)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: "var(--color-jade)", background: "var(--color-jade-dim)" }}>
            <h3 className="font-display text-base font-semibold text-ink">Dedicated Account Manager</h3>
            <p className="mt-2 text-xs text-ink-muted">Meera Joshi is your relationship manager for negotiation support and priority tickets.</p>
            <a href="/b2b/support" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-jade)" }}>
              Contact & spend analytics <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
