"use client";

import Link from "next/link";
import { Plus, Truck, Wallet, MessageSquareText } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import ProductThumb from "@/components/ProductThumb";
import { vendorNav } from "@/lib/vendorNav";
import { useStore } from "@/lib/store";

const quickActions = [
  { href: "/vendor/products", label: "Add a product", icon: Plus },
  { href: "/vendor/orders", label: "Process orders", icon: Truck },
  { href: "/vendor/earnings", label: "Request payout", icon: Wallet },
  { href: "/vendor/rfq", label: "Respond to RFQs", icon: MessageSquareText },
];

export default function VendorDashboard() {
  const { state, auth } = useStore();
  const vendor = state.vendors.find((v) => v.id === auth?.vendorId);
  const myProducts = state.products.filter((p) => p.vendorId === auth?.vendorId);
  const myOrders = state.orders.filter((o) => (o.vendorId ? o.vendorId === auth?.vendorId : o.vendor === vendor?.name));
  const lowStock = myProducts.filter((p) => p.stock < 200);

  const b2cSales = myOrders.filter((o) => o.type === "B2C").reduce((s, o) => s + o.amount, 0);
  const b2bSales = myOrders.filter((o) => o.type === "B2B").reduce((s, o) => s + o.amount, 0);
  const commission = Math.round((b2cSales + b2bSales) * 0.1);
  const netPayout = b2cSales + b2bSales - commission;

  return (
    <DashboardShell
      title={`Welcome back, ${vendor?.name || "Vendor"}`}
      roleLabel="Vendor Portal"
      accent="var(--color-gold)"
      nav={vendorNav}
      activeHref="/vendor/dashboard"
      requireRole="vendor"
    >
      {vendor?.status === "Under Review" && (
        <div className="mb-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "var(--color-gold)", background: "var(--color-gold-dim)", color: "var(--color-ink)" }}>
          <span className="font-semibold">KYC under review.</span> Aapki documents admin team review kar rahi hai — approval milte hi aapke products storefront par live ho jayenge.
        </div>
      )}
      {vendor?.status === "Suspended" && (
        <div className="mb-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "var(--color-rose)", background: "rgba(220,38,38,0.08)", color: "var(--color-ink)" }}>
          <span className="font-semibold">KYC rejected.</span>{" "}
          {vendor?.rejectionReason
            ? <>Reason: {vendor.rejectionReason} — issue fix karke dobara documents submit karein.</>
            : "Admin ne aapka account suspend kiya hai. Support se sampark karein."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="B2C Sales" value={`₹${b2cSales.toLocaleString("en-IN")}`} tone="gold" sub="From your orders" />
        <StatCard label="B2B Sales" value={`₹${b2bSales.toLocaleString("en-IN")}`} tone="jade" sub="From your orders" />
        <StatCard label="Commission (10%)" value={`₹${commission.toLocaleString("en-IN")}`} />
        <StatCard label="Net Payout Due" value={`₹${netPayout.toLocaleString("en-IN")}`} tone="gold" />
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
          <h2 className="font-display text-lg font-semibold text-ink">Recent Orders</h2>
          <div className="mt-3">
            {myOrders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">No orders yet.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Order ID" },
                  { key: "type", label: "Channel", render: (r) => <Badge tone={r.type === "B2B" ? "jade" : "gold"}>{r.type}</Badge> },
                  { key: "customer", label: "Customer" },
                  { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
                  { key: "status", label: "Status" },
                ]}
                rows={myOrders}
              />
            )}
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink">Your Catalog Snapshot</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {myProducts.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="rounded-xl border border-line bg-paper-raised p-3 transition-colors hover:border-[var(--color-gold)]">
                <span className="block h-9 w-9 overflow-hidden rounded-md text-2xl">
                  <ProductThumb image={p.image} fill emojiSize={22} />
                </span>
                <p className="mt-2 line-clamp-2 text-xs font-medium text-ink">{p.name}</p>
                <p className="mt-1 font-mono text-xs font-semibold text-ink">₹{p.price.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-ink-muted">{p.stock} in stock</p>
              </Link>
            ))}
            {myProducts.length === 0 && (
              <p className="col-span-full rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                No products listed yet — add your first one from Catalog & Inventory.
              </p>
            )}
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-paper-raised p-5">
          <h3 className="font-display text-base font-semibold text-ink">Low stock alerts</h3>
          <div className="mt-3 space-y-3">
            {lowStock.length === 0 && <p className="text-xs text-ink-muted">All products are healthy.</p>}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="block h-8 w-8 shrink-0 overflow-hidden rounded-md text-xl">
                  <ProductThumb image={p.image} fill emojiSize={18} />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-ink">{p.name}</p>
                  <p className="text-[11px] text-ink-muted">{p.stock} units left</p>
                </div>
                <Badge tone="rose">Restock</Badge>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "var(--color-gold)", background: "var(--color-gold-dim)" }}>
            <p className="text-xs font-semibold text-ink">Your storefront</p>
            <p className="mt-1 text-xs text-ink-muted">Buyers can visit your dedicated store page and browse everything you sell.</p>
            {auth?.vendorId && (
              <Link href={`/store/${auth.vendorId}`} target="_blank" className="mt-2 inline-block text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
                View public storefront →
              </Link>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
