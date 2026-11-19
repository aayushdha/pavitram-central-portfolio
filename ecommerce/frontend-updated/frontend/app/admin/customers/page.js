"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, Search } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { Input } from "@/components/Field";
import Modal from "@/components/Modal";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";
import api from "@/lib/api";

const TABS = [
  { key: "customer", label: "Customers" },
  { key: "vendor", label: "Vendor Accounts" },
  { key: "b2b", label: "Business Accounts" },
  { key: "admin", label: "Admins" },
];

export default function AdminCustomersPage() {
  const { state } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("customer");
  const [search, setSearch] = useState("");
  // BUGFIX: the guide (Section 4.3) promises admins can see a customer's
  // order history from this page "for support/investigation" — there was
  // no such view at all. Uses the userId now persisted on Order (see the
  // Order.userId fix) so this is scoped correctly, not by mutable name.
  const [ordersFor, setOrdersFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.users.list({ limit: 200 });
      const data = Array.isArray(res) ? res : res?.data || [];
      setUsers(data);
    } catch {
      /* leave list empty on failure */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Vendor/B2B users are "approved" once their linked vendor/business-buyer
  // record has been moved out of Under Review by an admin — cross-reference
  // against the vendors / businessBuyers already loaded in global state so
  // this page doesn't need its own separate approval concept.
  const vendorStatusById = useMemo(
    () => Object.fromEntries(state.vendors.map((v) => [v.id, v.status])),
    [state.vendors]
  );
  const buyerStatusById = useMemo(
    () => Object.fromEntries(state.businessBuyers.map((b) => [b.id, b.status])),
    [state.businessBuyers]
  );

  const approvalStatus = (u) => {
    if (u.role === "vendor") return u.vendorId ? vendorStatusById[u.vendorId] || "Pending" : "Not started";
    if (u.role === "b2b") return u.buyerId ? buyerStatusById[u.buyerId] || "Pending" : "Not started";
    return null;
  };

  const counts = useMemo(() => {
    const c = { customer: 0, vendor: 0, b2b: 0, admin: 0 };
    users.forEach((u) => {
      if (c[u.role] !== undefined) c[u.role] += 1;
    });
    return c;
  }, [users]);

  const rows = useMemo(() => {
    let list = users.filter((u) => u.role === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, tab, search]);

  return (
    <DashboardShell
      title="Customers & Users"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/customers"
      requireRole="admin"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 rounded-full border border-line bg-paper-raised p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition"
              style={
                tab === t.key
                  ? { background: "var(--color-gold-dim)", color: "var(--color-gold)" }
                  : { color: "var(--color-ink-muted)" }
              }
            >
              {t.label}
              <span
                className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]"
                style={{ background: "var(--color-ink)", color: "white" }}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              className="w-56 pl-8"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-semibold text-ink-muted hover:text-ink disabled:opacity-60"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {!loading && rows.length === 0 && (
        <div className="mb-4 rounded-2xl border border-line bg-paper-raised px-4 py-3 text-sm text-ink-muted">
          No {TABS.find((t) => t.key === tab)?.label.toLowerCase()} {search ? "match that search." : "yet."}
        </div>
      )}

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
          {
            key: "role",
            label: "Role",
            render: (r) => (
              <Badge tone={r.role === "admin" ? "navy" : r.role === "vendor" ? "gold" : r.role === "b2b" ? "jade" : "ink"}>
                {r.role === "b2b" ? "Business" : r.role.charAt(0).toUpperCase() + r.role.slice(1)}
              </Badge>
            ),
          },
          ...(tab === "vendor" || tab === "b2b"
            ? [
                {
                  key: "approval",
                  label: "Approval Status",
                  render: (r) => {
                    const s = approvalStatus(r);
                    if (!s) return <span className="text-xs text-ink-muted">—</span>;
                    return (
                      <Badge tone={s === "Active" ? "jade" : s === "Under Review" || s === "Pending" ? "gold" : "rose"}>
                        {s}
                      </Badge>
                    );
                  },
                },
              ]
            : []),
          {
            key: "createdAt",
            label: "Joined",
            render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"),
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <button onClick={() => setOrdersFor(r)} className="text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
                View orders
              </button>
            ),
          },
        ]}
        rows={rows}
      />

      <Modal open={!!ordersFor} onClose={() => setOrdersFor(null)} title={ordersFor ? `Order history — ${ordersFor.name}` : "Order history"}>
        {ordersFor && (() => {
          const customerOrders = state.orders.filter((o) => (o.userId ? o.userId === ordersFor.id : o.customer === ordersFor.name));
          return customerOrders.length === 0 ? (
            <p className="text-sm text-ink-muted">No orders found for this account.</p>
          ) : (
            <DataTable
              columns={[
                { key: "id", label: "Order" },
                { key: "vendor", label: "Vendor" },
                { key: "amount", label: "Amount", render: (o) => `₹${o.amount.toLocaleString("en-IN")}` },
                { key: "trackingStatus", label: "Status" },
                { key: "date", label: "Date" },
              ]}
              rows={customerOrders}
            />
          );
        })()}
      </Modal>
    </DashboardShell>
  );
}
