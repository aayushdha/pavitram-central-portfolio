"use client";

import Link from "next/link";
import { ShieldCheck, Building2, Megaphone, BarChart3 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";

const quickActions = [
  { href: "/admin/vendors", label: "Approve vendors", icon: ShieldCheck },
  { href: "/admin/b2b-accounts", label: "Review B2B credit", icon: Building2 },
  { href: "/admin/cms", label: "Launch a campaign", icon: Megaphone },
  { href: "/admin/analytics", label: "Open analytics", icon: BarChart3 },
];

export default function AdminDashboard() {
  const { state } = useStore();
  const { orders, vendors, businessBuyers } = state;

  const gmvB2C = orders.filter((o) => o.type === "B2C").reduce((s, o) => s + o.amount, 0);
  const gmvB2B = orders.filter((o) => o.type === "B2B").reduce((s, o) => s + o.amount, 0);
  const activeVendors = vendors.filter((v) => v.status === "Active").length;
  const pendingB2B = businessBuyers.filter((b) => b.status === "Under Review").length;

  return (
    <DashboardShell
      title="Control Tower"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/dashboard"
      requireRole="admin"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV — B2C" value={`₹${gmvB2C.toLocaleString("en-IN")}`} tone="gold" sub="Live, from orders" />
        <StatCard label="GMV — B2B" value={`₹${gmvB2B.toLocaleString("en-IN")}`} tone="jade" sub="Live, from orders" />
        <StatCard label="Active Vendors" value={activeVendors} />
        <StatCard label="Pending B2B Approvals" value={pendingB2B} tone="rose" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-[var(--color-gold)]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: "var(--color-gold-dim)" }}>
              <a.icon size={15} style={{ color: "var(--color-gold)" }} />
            </span>
            {a.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Marketplace-wide Orders</h2>
          <div className="mt-3">
            <DataTable
              columns={[
                { key: "id", label: "Order ID" },
                { key: "type", label: "Channel", render: (r) => <Badge tone={r.type === "B2B" ? "jade" : "gold"}>{r.type}</Badge> },
                { key: "vendor", label: "Vendor" },
                { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
                { key: "status", label: "Status" },
              ]}
              rows={orders.slice(0, 8)}
            />
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink">Newest verified stores</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {vendors.filter((v) => v.status === "Active").slice(0, 4).map((v) => (
              <Link key={v.id} href={`/store/${v.id}`} target="_blank" className="rounded-xl border border-line bg-paper-raised p-3 transition-colors hover:border-[var(--color-gold)]">
                <p className="text-xs font-semibold text-ink">{v.name}</p>
                <p className="mt-1 text-[11px] text-ink-muted">Since {v.joined} · ★ {v.rating}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-paper-raised p-5">
          <h3 className="font-display text-base font-semibold text-ink">Vendors flagged for review</h3>
          <div className="mt-3 space-y-3">
            {vendors.filter((v) => v.status === "On Hold" || v.status === "Under Review").map((v) => (
              <div key={v.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink">{v.name}</p>
                  <p className="text-[11px] text-ink-muted">Returns {v.returns}</p>
                </div>
                <Badge tone="rose">{v.status}</Badge>
              </div>
            ))}
            {vendors.filter((v) => v.status === "On Hold" || v.status === "Under Review").length === 0 && (
              <p className="text-xs text-ink-muted">No vendors currently flagged.</p>
            )}
            <p className="text-xs text-ink-muted">
              {pendingB2B} business registration{pendingB2B === 1 ? "" : "s"} awaiting GST/KYC review.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
