"use client";

import Link from "next/link";
import { PackageSearch, Heart, MapPin, ArrowUpRight } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import { accountNav } from "@/lib/accountNav";
import { useStore } from "@/lib/store";

export default function AccountPage() {
  const { state, auth } = useStore();
  const myOrders = state.orders.filter((o) => o.customer === auth?.name);
  const delivered = myOrders.filter((o) => o.status === "Delivered").length;
  const inTransit = myOrders.filter((o) => o.status === "Shipped" || o.status === "Ready to Ship").length;

  return (
    <DashboardShell
      title={`Hi, ${auth?.name?.split(" ")[0] || "there"}`}
      roleLabel="My Account"
      accent="var(--color-gold)"
      nav={accountNav}
      activeHref="/account"
      requireRole="customer"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Orders" value={myOrders.length} icon={PackageSearch} />
        <StatCard label="In Transit" value={inTransit} tone="gold" />
        <StatCard label="Delivered" value={delivered} tone="green" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Link href="/account/orders" className="flex items-center gap-2.5 rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-[var(--color-gold)]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: "var(--color-gold-dim)" }}>
            <PackageSearch size={15} style={{ color: "var(--color-gold)" }} />
          </span>
          Track my orders
        </Link>
        <Link href="/wishlist" className="flex items-center gap-2.5 rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-[var(--color-gold)]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: "var(--color-gold-dim)" }}>
            <Heart size={15} style={{ color: "var(--color-gold)" }} />
          </span>
          View wishlist ({state.wishlist.length})
        </Link>
        <Link href="/account/addresses" className="flex items-center gap-2.5 rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-[var(--color-gold)]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: "var(--color-gold-dim)" }}>
            <MapPin size={15} style={{ color: "var(--color-gold)" }} />
          </span>
          Manage addresses
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
            View all <ArrowUpRight size={13} />
          </Link>
        </div>
        {myOrders.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">
            No orders yet — your purchases will show up here.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {myOrders.slice(0, 4).map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm">
                <div>
                  <span className="font-mono text-xs font-semibold text-ink">{o.id}</span>
                  <span className="ml-2 text-ink-muted">{o.vendor}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink">₹{o.amount.toLocaleString("en-IN")}</span>
                  <Badge tone={o.status === "Delivered" ? "green" : "gold"}>{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
