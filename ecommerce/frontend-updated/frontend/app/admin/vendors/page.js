"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, FileText, RefreshCw, PackageCheck } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import ProductThumb from "@/components/ProductThumb";
import { Field, Input, Select, Button } from "@/components/Field";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";
import api from "@/lib/api";

const emptyForm = { name: "", channel: "Both", status: "Active", gmvB2C: 0, gmvB2B: 0, rating: 4.5, returns: "1%" };

// Pending = submitted KYC, waiting on admin action. Everything else
// (Active / On Hold / Suspended) is treated as "already decided" and
// shown in the Approved tab so the review queue only ever holds work
// that's actually left to do.
const isPending = (v) => (v.status || "").toLowerCase() === "under review";

export default function AdminVendorsPage() {
  const { state, setState, vendors, products } = useStore();
  const [section, setSection] = useState("kyc"); // "kyc" | "products"
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [kycDocsFor, setKycDocsFor] = useState(null);
  const [tab, setTab] = useState("pending");
  const [refreshing, setRefreshing] = useState(false);
  const [rejectFor, setRejectFor] = useState(null); // vendor object being rejected — opens reason modal
  const [rejectReason, setRejectReason] = useState("");

  // Product-moderation queue state
  const [productTab, setProductTab] = useState("pending");
  const [productRejectFor, setProductRejectFor] = useState(null);
  const [productRejectReason, setProductRejectReason] = useState("");
  const [productsRefreshing, setProductsRefreshing] = useState(false);

  // The app's global state is fetched once when it first loads, so a vendor
  // who submits KYC after this admin tab was already open won't show up
  // until we explicitly re-fetch. Do that on mount, and let the admin force
  // it again with the Refresh button below.
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.vendors.list({ limit: 200 });
      const data = Array.isArray(res) ? res : res?.data || [];
      setState((s) => ({ ...s, vendors: data }));
    } catch {
      /* leave existing list as-is if the refetch fails */
    } finally {
      setRefreshing(false);
    }
  }, [setState]);

  const refreshProducts = useCallback(async () => {
    setProductsRefreshing(true);
    try {
      // No status filter here on purpose — this admin queue needs to see
      // Pending + Approved + Rejected all at once (the storefront is the
      // only caller that should ever pass status=Approved).
      const res = await api.products.list({ limit: 300 });
      const data = Array.isArray(res) ? res : res?.data || [];
      setState((s) => ({ ...s, products: data }));
    } catch {
      /* leave existing list as-is if the refetch fails */
    } finally {
      setProductsRefreshing(false);
    }
  }, [setState]);

  useEffect(() => {
    refresh();
    refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingVendors = state.vendors.filter(isPending);
  const approvedVendors = state.vendors.filter((v) => !isPending(v));
  const rows = tab === "pending" ? pendingVendors : approvedVendors;

  const pendingProducts = state.products.filter((p) => (p.status || "Pending") === "Pending");
  const approvedProducts = state.products.filter((p) => p.status === "Approved");
  const rejectedProducts = state.products.filter((p) => p.status === "Rejected");
  const productRows = productTab === "pending" ? pendingProducts : productTab === "approved" ? approvedProducts : rejectedProducts;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };
  const openEdit = (v) => {
    setEditing(v);
    setForm(v);
    setModal(true);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, gmvB2C: Number(form.gmvB2C) || 0, gmvB2B: Number(form.gmvB2B) || 0, rating: Number(form.rating) || 0 };
    if (editing) vendors.update(editing.id, payload, { log: `Updated vendor ${payload.name}` });
    else vendors.add(payload, { log: `Added vendor ${payload.name}` });
    setModal(false);
  };
  const remove = (v) => {
    if (confirm(`Remove vendor "${v.name}"? This cannot be undone.`)) vendors.remove(v.id, { log: `Removed vendor ${v.name}` });
  };

  const openReject = (v) => {
    setRejectReason(v.rejectionReason || "");
    setRejectFor(v);
  };
  const confirmReject = () => {
    if (!rejectFor) return;
    if (!rejectReason.trim()) {
      alert("Reject karne ke liye reason likhna zaroori hai — vendor ko yahi wapas dikhaya jaayega.");
      return;
    }
    vendors.update(
      rejectFor.id,
      { status: "Suspended", rejectionReason: rejectReason.trim() },
      { message: `${rejectFor.name} rejected`, log: `Rejected vendor ${rejectFor.name}: ${rejectReason.trim()}` }
    );
    setRejectFor(null);
    setKycDocsFor(null);
  };

  // ---- Product moderation actions ----
  const approveProduct = (p) =>
    products.update(
      p.id,
      { status: "Approved", rejectionReason: null },
      { message: `${p.name} approved — now live on storefront`, log: `Approved product ${p.name} (vendor: ${p.vendor})` }
    );
  const openProductReject = (p) => {
    setProductRejectReason(p.rejectionReason || "");
    setProductRejectFor(p);
  };
  const confirmProductReject = () => {
    if (!productRejectFor) return;
    if (!productRejectReason.trim()) {
      alert("Reject karne ke liye reason likhna zaroori hai — vendor ko yahi unke product list par dikhaya jaayega.");
      return;
    }
    products.update(
      productRejectFor.id,
      { status: "Rejected", rejectionReason: productRejectReason.trim() },
      { message: `${productRejectFor.name} rejected`, log: `Rejected product ${productRejectFor.name}: ${productRejectReason.trim()}` }
    );
    setProductRejectFor(null);
  };

  return (
    <DashboardShell
      title="Vendor Lifecycle Management"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/vendors"
      requireRole="admin"
    >
      {/* Top-level: KYC review vs Product moderation — two different queues that
          both live under "Vendor Lifecycle" since both gate a vendor's ability
          to actually sell on the marketplace. */}
      <div className="mb-5 flex gap-2 rounded-full border border-line bg-paper-raised p-1 w-fit">
        <button
          onClick={() => setSection("kyc")}
          className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
          style={section === "kyc" ? { background: "var(--color-ink)", color: "white" } : { color: "var(--color-ink-muted)" }}
        >
          Vendor KYC
        </button>
        <button
          onClick={() => setSection("products")}
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition"
          style={section === "products" ? { background: "var(--color-ink)", color: "white" } : { color: "var(--color-ink-muted)" }}
        >
          <PackageCheck size={13} /> Product Approvals
          {pendingProducts.length > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]" style={{ background: "var(--color-rose)", color: "white" }}>
              {pendingProducts.length}
            </span>
          )}
        </button>
      </div>

      {section === "kyc" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 rounded-full border border-line bg-paper-raised p-1">
              <button
                onClick={() => setTab("pending")}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition"
                style={
                  tab === "pending"
                    ? { background: "var(--color-gold-dim)", color: "var(--color-gold)" }
                    : { color: "var(--color-ink-muted)" }
                }
              >
                Pending Verification
                <span
                  className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]"
                  style={{ background: "var(--color-ink)", color: "white" }}
                >
                  {pendingVendors.length}
                </span>
              </button>
              <button
                onClick={() => setTab("approved")}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition"
                style={
                  tab === "approved"
                    ? { background: "var(--color-jade-dim)", color: "var(--color-jade)" }
                    : { color: "var(--color-ink-muted)" }
                }
              >
                Approved Vendors
                <span
                  className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]"
                  style={{ background: "var(--color-ink)", color: "white" }}
                >
                  {approvedVendors.length}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-semibold text-ink-muted hover:text-ink disabled:opacity-60"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
              <Button onClick={openAdd} className="flex items-center gap-1.5"><Plus size={15} /> Add vendor</Button>
            </div>
          </div>

          {tab === "pending" && pendingVendors.length === 0 && (
            <div className="mb-4 rounded-2xl border border-line bg-paper-raised px-4 py-3 text-sm text-ink-muted">
              No vendors waiting on review right now. Newly submitted KYC applications will appear here.
            </div>
          )}

          <DataTable
            columns={[
              { key: "name", label: "Vendor" },
              { key: "channel", label: "Channel", render: (r) => <Badge tone={r.channel === "B2B Only" ? "jade" : r.channel === "B2C Only" ? "gold" : "ink"}>{r.channel}</Badge> },
              { key: "gmvB2C", label: "GMV (B2C)", render: (r) => `₹${(r.gmvB2C || 0).toLocaleString("en-IN")}` },
              { key: "gmvB2B", label: "GMV (B2B)", render: (r) => `₹${(r.gmvB2B || 0).toLocaleString("en-IN")}` },
              { key: "rating", label: "Rating" },
              { key: "returns", label: "Return %" },
              {
                key: "kycDocuments",
                label: "KYC Docs",
                render: (r) => {
                  const count = r.kycDocuments ? Object.keys(r.kycDocuments).length : 0;
                  return count > 0 ? (
                    <button
                      onClick={() => setKycDocsFor(r)}
                      className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: "var(--color-jade)" }}
                    >
                      <FileText size={13} /> {count} file{count > 1 ? "s" : ""}
                    </button>
                  ) : (
                    <span className="text-xs text-ink-muted">None</span>
                  );
                },
              },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <div className="flex flex-col gap-0.5">
                    <Badge tone={r.status === "Active" ? "jade" : r.status === "Under Review" ? "gold" : "rose"}>{r.status}</Badge>
                    {r.status === "Suspended" && r.rejectionReason && (
                      <span className="max-w-[160px] truncate text-[10px] text-ink-muted" title={r.rejectionReason}>
                        Reason: {r.rejectionReason}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex flex-wrap gap-2">
                    {r.status !== "Active" && (
                      <button onClick={() => vendors.update(r.id, { status: "Active", rejectionReason: null }, { message: `${r.name} approved`, log: `Approved vendor ${r.name}` })} className="text-xs font-semibold" style={{ color: "var(--color-jade)" }}>Approve</button>
                    )}
                    {r.status !== "Suspended" && (
                      <button onClick={() => openReject(r)} className="text-xs font-semibold" style={{ color: "var(--color-rose)" }}>Reject</button>
                    )}
                    <button onClick={() => openEdit(r)} className="text-ink-muted hover:text-ink"><Pencil size={14} /></button>
                    <button onClick={() => remove(r)} style={{ color: "var(--color-rose)" }}><Trash2 size={14} /></button>
                  </div>
                ),
              },
            ]}
            rows={rows}
          />
        </>
      )}

      {section === "products" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 rounded-full border border-line bg-paper-raised p-1">
              {[
                { k: "pending", label: "Pending Review", list: pendingProducts, tone: "gold" },
                { k: "approved", label: "Approved (Live)", list: approvedProducts, tone: "jade" },
                { k: "rejected", label: "Rejected", list: rejectedProducts, tone: "rose" },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setProductTab(t.k)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition"
                  style={
                    productTab === t.k
                      ? { background: `var(--color-${t.tone}-dim)`, color: `var(--color-${t.tone})` }
                      : { color: "var(--color-ink-muted)" }
                  }
                >
                  {t.label}
                  <span className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]" style={{ background: "var(--color-ink)", color: "white" }}>
                    {t.list.length}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={refreshProducts}
              disabled={productsRefreshing}
              className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-semibold text-ink-muted hover:text-ink disabled:opacity-60"
            >
              <RefreshCw size={13} className={productsRefreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {productTab === "pending" && pendingProducts.length === 0 && (
            <div className="mb-4 rounded-2xl border border-line bg-paper-raised px-4 py-3 text-sm text-ink-muted">
              No products waiting on review. Jab bhi koi vendor naya product upload karega ya kisi listing ko edit karega, wo yahan aa jayega — jab tak approve nahi hota, storefront par nahi dikhega.
            </div>
          )}

          <DataTable
            columns={[
              {
                key: "name",
                label: "Product",
                render: (r) => (
                  <div className="flex items-center gap-2.5">
                    <span className="block h-8 w-8 overflow-hidden rounded-md text-xl">
                      <ProductThumb image={r.image} fill emojiSize={18} />
                    </span>
                    <span className="max-w-[220px] truncate font-medium">{r.name}</span>
                  </div>
                ),
              },
              { key: "vendor", label: "Vendor", render: (r) => r.vendor || "—" },
              { key: "category", label: "Category", render: (r) => r.category || "—" },
              { key: "price", label: "Price", render: (r) => `₹${(r.price || 0).toLocaleString("en-IN")}` },
              { key: "stock", label: "Stock", render: (r) => (r.stock ?? 0).toLocaleString("en-IN") },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <div className="flex flex-col gap-0.5">
                    <Badge tone={r.status === "Approved" ? "jade" : r.status === "Rejected" ? "rose" : "gold"}>{r.status || "Pending"}</Badge>
                    {r.status === "Rejected" && r.rejectionReason && (
                      <span className="max-w-[160px] truncate text-[10px] text-ink-muted" title={r.rejectionReason}>
                        Reason: {r.rejectionReason}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex flex-wrap gap-2">
                    {r.status !== "Approved" && (
                      <button onClick={() => approveProduct(r)} className="text-xs font-semibold" style={{ color: "var(--color-jade)" }}>Approve</button>
                    )}
                    {r.status !== "Rejected" && (
                      <button onClick={() => openProductReject(r)} className="text-xs font-semibold" style={{ color: "var(--color-rose)" }}>Reject</button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={productRows}
          />
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit vendor" : "Add vendor"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Vendor name" required>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Channel">
              <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option>Both</option>
                <option>B2C Only</option>
                <option>B2B Only</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Active</option>
                <option>Under Review</option>
                <option>On Hold</option>
                <option>Suspended</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="GMV — B2C (₹)">
              <Input type="number" value={form.gmvB2C} onChange={(e) => setForm({ ...form, gmvB2C: e.target.value })} />
            </Field>
            <Field label="GMV — B2B (₹)">
              <Input type="number" value={form.gmvB2B} onChange={(e) => setForm({ ...form, gmvB2B: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating">
              <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            </Field>
            <Field label="Return %">
              <Input value={form.returns} onChange={(e) => setForm({ ...form, returns: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" className="w-full">{editing ? "Save changes" : "Add vendor"}</Button>
        </form>
      </Modal>

      <Modal open={!!kycDocsFor} onClose={() => setKycDocsFor(null)} title={`${kycDocsFor?.name || ""} — KYC documents`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kycDocsFor?.kycDocuments && Object.keys(kycDocsFor.kycDocuments).length > 0 ? (
            Object.entries(kycDocsFor.kycDocuments).map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-line">
                {/\.(png|jpe?g|gif|webp)$/i.test(url) ? (
                  <img src={url} alt={label} className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 w-full flex-col items-center justify-center gap-1 bg-paper-raised px-2 text-center">
                    <FileText size={18} style={{ color: "var(--color-ink-muted)" }} />
                  </div>
                )}
                <div className="px-2 py-1.5 text-center text-[11px] font-medium text-ink">{label}</div>
              </a>
            ))
          ) : (
            <p className="col-span-full text-sm text-ink-muted">No KYC documents uploaded yet.</p>
          )}
        </div>
        {kycDocsFor && (
          <div className="mt-4 flex gap-2">
            {kycDocsFor.status !== "Active" && (
              <Button
                className="flex-1"
                onClick={() => {
                  vendors.update(kycDocsFor.id, { status: "Active", rejectionReason: null }, { message: `${kycDocsFor.name} approved`, log: `Approved vendor ${kycDocsFor.name} after KYC review` });
                  setKycDocsFor(null);
                }}
              >
                Approve vendor
              </Button>
            )}
            {kycDocsFor.status !== "Suspended" && (
              <Button
                variant="ghost"
                className="flex-1"
                style={{ color: "var(--color-rose)" }}
                onClick={() => openReject(kycDocsFor)}
              >
                Reject
              </Button>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!rejectFor} onClose={() => setRejectFor(null)} title={`Reject ${rejectFor?.name || ""}`}>
        <p className="mb-3 text-sm text-ink-muted">
          Yeh reason vendor ke apne dashboard par dikhaya jaayega, taaki unhe pata chale KYC kyun reject hui aur kya fix karna hai.
        </p>
        <Field label="Rejection reason" required>
          <textarea
            autoFocus
            required
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. GST certificate blurry hai, dobara clear photo upload karein."
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Button className="mt-3 w-full" style={{ background: "var(--color-rose)" }} onClick={confirmReject}>
          Confirm reject
        </Button>
      </Modal>

      <Modal open={!!productRejectFor} onClose={() => setProductRejectFor(null)} title={`Reject "${productRejectFor?.name || ""}"`}>
        <p className="mb-3 text-sm text-ink-muted">
          Yeh reason vendor ko unke Catalog & Inventory page par dikhega, taaki unhe pata chale listing kyun reject hui.
        </p>
        <Field label="Rejection reason" required>
          <textarea
            autoFocus
            required
            rows={4}
            value={productRejectReason}
            onChange={(e) => setProductRejectReason(e.target.value)}
            placeholder="e.g. Product image saaf nahi hai / description misleading hai / price galat lag raha hai."
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Button className="mt-3 w-full" style={{ background: "var(--color-rose)" }} onClick={confirmProductReject}>
          Confirm reject
        </Button>
      </Modal>
    </DashboardShell>
  );
}
