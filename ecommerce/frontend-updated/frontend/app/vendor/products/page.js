"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, Input, TextArea, Select, Button } from "@/components/Field";
import FileUpload from "@/components/FileUpload";
import ProductThumb from "@/components/ProductThumb";
import { vendorNav } from "@/lib/vendorNav";
import { useStore } from "@/lib/store";

const emptyFormBase = {
  name: "",
  category: "",
  image: "📦",
  images: [],
  videos: [],
  color: "#8A6D3B",
  mrp: "",
  price: "",
  stock: "",
  moq: "",
  channels: ["b2c"],
  description: "",
  tierPricing: [{ min: 1, max: null, price: "" }],
  variants: [],
};

export default function VendorProductsPage() {
  const { state, auth, products, notify } = useStore();
  const categories = state.categories;
  const emptyForm = { ...emptyFormBase, category: categories[0]?.id || "" };
  const vendor = state.vendors.find((v) => v.id === auth?.vendorId);
  const myProducts = state.products.filter((p) => p.vendorId === auth?.vendorId);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [csvOpen, setCsvOpen] = useState(false);

  const openAdd = () => { setForm(emptyForm); setModal({ mode: "add" }); };
  const openEdit = (p) => {
    setForm({
      ...p,
      tierPricing: p.tierPricing?.length ? p.tierPricing : [{ min: 1, max: null, price: p.price }],
      variants: p.variants || [],
    });
    setModal({ mode: "edit", id: p.id });
  };

  const toggleChannel = (c) =>
    setForm((f) => ({ ...f, channels: f.channels.includes(c) ? f.channels.filter((x) => x !== c) : [...f.channels, c] }));

  const updateTier = (i, key, val) =>
    setForm((f) => ({ ...f, tierPricing: f.tierPricing.map((t, idx) => (idx === i ? { ...t, [key]: val } : t)) }));
  const addTier = () => setForm((f) => ({ ...f, tierPricing: [...f.tierPricing, { min: "", max: null, price: "" }] }));
  const removeTier = (i) => setForm((f) => ({ ...f, tierPricing: f.tierPricing.filter((_, idx) => idx !== i) }));

  const updateVariant = (i, key, val) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)) }));
  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, { id: `var_${Date.now()}${f.variants.length}`, name: "", price: "", stock: "", sku: "" }] }));
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      mrp: Number(form.mrp) || 0,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      moq: form.channels.includes("b2b") ? Number(form.moq) || 1 : 0,
      vendor: vendor?.name || "Unknown vendor",
      vendorId: auth?.vendorId,
      rating: form.rating || 4.5,
      reviews: form.reviews || 0,
      tierPricing: form.channels.includes("b2b")
        ? form.tierPricing.map((t) => ({ min: Number(t.min) || 1, max: t.max === null || t.max === "" ? null : Number(t.max), price: Number(t.price) || 0 }))
        : [],
      variants: form.variants.map((v) => ({ ...v, price: v.price === "" ? undefined : Number(v.price), stock: Number(v.stock) || 0 })),
    };
    if (modal.mode === "add") {
      products.add(payload, { message: "Product added", log: `Vendor ${vendor?.name} listed new product: ${payload.name}` });
    } else {
      products.update(modal.id, payload, { message: "Product updated", log: `Vendor ${vendor?.name} updated product: ${payload.name}` });
    }
    setModal(null);
  };

  const remove = (p) => {
    if (confirm(`Delete "${p.name}"? This will remove it from the marketplace.`)) {
      products.remove(p.id, { message: "Product deleted", log: `Vendor ${vendor?.name} deleted product: ${p.name}` });
    }
  };

  const simulateBulkUpload = () => {
    setCsvOpen(false);
    notify("12 products imported from CSV (demo)");
  };

  return (
    <DashboardShell
      title="Catalog & Inventory"
      roleLabel="Vendor Portal"
      accent="var(--color-gold)"
      nav={vendorNav}
      activeHref="/vendor/products"
      requireRole="vendor"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">{myProducts.length} listed products</p>
          <p className="text-xs text-ink-muted">Naya product ya koi bhi edit admin review ke liye "Pending" me jaata hai — approve hone ke baad hi storefront par dikhega.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCsvOpen(true)} className="flex items-center gap-1.5 rounded-full border border-line bg-paper-raised px-4 py-2 text-sm font-medium text-ink">
            <Upload size={14} /> Bulk upload (CSV)
          </button>
          <Button variant="gold" onClick={openAdd}><Plus size={15} /> Add Product</Button>
        </div>
      </div>

      {myProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-12 text-center">
          <p className="font-display text-base font-semibold text-ink">No products listed yet</p>
          <p className="mt-1 text-sm text-ink-muted">Add your first product to start selling on Pavitram.</p>
        </div>
      ) : (
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
            {
              key: "channels",
              label: "Channel",
              render: (r) => (
                <div className="flex gap-1">
                  {r.channels.includes("b2c") && <Badge tone="gold">B2C</Badge>}
                  {r.channels.includes("b2b") && <Badge tone="jade">B2B</Badge>}
                </div>
              ),
            },
            { key: "price", label: "Retail Price", render: (r) => `₹${r.price.toLocaleString("en-IN")}` },
            { key: "moq", label: "MOQ", render: (r) => (r.channels.includes("b2b") ? `${r.moq} units` : "—") },
            { key: "variants", label: "Variants", render: (r) => (r.variants?.length ? `${r.variants.length} variants` : "—") },
            { key: "stock", label: "Stock", render: (r) => r.stock.toLocaleString("en-IN") },
            {
              key: "stockStatus",
              label: "Stock Status",
              render: (r) => <Badge tone={r.stock === 0 ? "rose" : r.stock < 200 ? "gold" : "jade"}>{r.stock === 0 ? "Out of Stock" : r.stock < 200 ? "Low Stock" : "In Stock"}</Badge>,
            },
            {
              key: "approval",
              label: "Approval",
              render: (r) => (
                <div className="flex flex-col gap-0.5">
                  <Badge tone={r.status === "Approved" ? "jade" : r.status === "Rejected" ? "rose" : "gold"}>
                    {r.status || "Pending"}
                  </Badge>
                  {r.status === "Rejected" && r.rejectionReason && (
                    <span className="max-w-[180px] text-[10px] text-ink-muted" title={r.rejectionReason}>
                      {r.rejectionReason}
                    </span>
                  )}
                  {(!r.status || r.status === "Pending") && (
                    <span className="text-[10px] text-ink-muted">Admin review ke baad storefront par live hoga</span>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(r)} className="text-ink-muted hover:text-ink"><Pencil size={14} /></button>
                  <button onClick={() => remove(r)} style={{ color: "var(--color-rose)" }}><Trash2 size={14} /></button>
                </div>
              ),
            },
          ]}
          rows={myProducts}
        />
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "add" ? "Add product" : "Edit product"} width="max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <FileUpload
              label="Product photo"
              folder="product-images"
              value={form.image && /^https?:\/\//.test(form.image) ? [{ id: "current", url: form.image }] : []}
              onChange={(files) => setForm((f) => ({ ...f, image: files[0]?.url || "📦" }))}
            />
            {!/^https?:\/\//.test(form.image || "") && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-ink-muted">No photo yet — using a placeholder icon:</span>
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} maxLength={2} className="!w-16 text-center" />
              </div>
            )}
          </div>

          <div>
            <FileUpload
              label="Photo gallery (add as many as you like — customers can swipe through all of them)"
              folder="product-images"
              multiple
              accept="image/*"
              value={(form.images || []).map((url, i) => ({ id: `img-${i}`, url }))}
              onChange={(files) => {
                const urls = files.map((f) => f.url);
                setForm((f) => ({
                  ...f,
                  images: urls,
                  // Keep the cover photo in sync with the first gallery image
                  // if no cover was set manually yet.
                  image: /^https?:\/\//.test(f.image || "") ? f.image : urls[0] || f.image,
                }));
              }}
            />
          </div>

          <div>
            <FileUpload
              label="Product videos (optional)"
              folder="product-videos"
              multiple
              accept="video/*"
              value={(form.videos || []).map((url, i) => ({ id: `vid-${i}`, url }))}
              onChange={(files) => setForm((f) => ({ ...f, videos: files.map((v) => v.url) }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" required>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Accent color">
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="MRP (₹)" required><Input type="number" required value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} /></Field>
            <Field label="Retail price (₹)" required><Input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            <Field label="Total stock" required><Input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
          </div>

          <Field label="Description">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Sell to</span>
            <div className="mt-2 flex gap-2">
              {[{ k: "b2c", label: "Retail (B2C)" }, { k: "b2b", label: "Bulk (B2B)" }].map((c) => (
                <button
                  type="button"
                  key={c.k}
                  onClick={() => toggleChannel(c.k)}
                  className="rounded-full border px-4 py-2 text-sm font-medium"
                  style={{
                    borderColor: form.channels.includes(c.k) ? "var(--color-gold)" : "var(--color-line)",
                    background: form.channels.includes(c.k) ? "var(--color-gold-dim)" : "transparent",
                    color: "var(--color-ink)",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {form.channels.includes("b2b") && (
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-jade)", background: "var(--color-jade-dim)" }}>
              <div className="flex items-center justify-between">
                <Field label="Minimum order quantity (MOQ)">
                  <Input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} className="!w-32" />
                </Field>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Quantity-based (tiered) pricing slabs
              </p>
              <div className="mt-2 space-y-2">
                {form.tierPricing.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input type="number" placeholder="Min qty" value={t.min} onChange={(e) => updateTier(i, "min", e.target.value)} className="!w-24" />
                    <span className="text-xs text-ink-muted">to</span>
                    <Input type="number" placeholder="Max (blank = ∞)" value={t.max ?? ""} onChange={(e) => updateTier(i, "max", e.target.value === "" ? null : e.target.value)} className="!w-32" />
                    <span className="text-xs text-ink-muted">@ ₹</span>
                    <Input type="number" placeholder="Price/unit" value={t.price} onChange={(e) => updateTier(i, "price", e.target.value)} className="!w-28" />
                    {form.tierPricing.length > 1 && (
                      <button type="button" onClick={() => removeTier(i)} style={{ color: "var(--color-rose)" }}><X size={15} /></button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addTier} className="mt-2 text-xs font-semibold" style={{ color: "var(--color-jade)" }}>+ Add price slab</button>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Variants (size / color, each with own stock)</span>
              <button type="button" onClick={addVariant} className="text-xs font-semibold" style={{ color: "var(--color-gold)" }}>+ Add variant</button>
            </div>
            {form.variants.length === 0 && <p className="mt-2 text-xs text-ink-muted">No variants — this product is sold as a single SKU.</p>}
            <div className="mt-2 space-y-2">
              {form.variants.map((v, i) => (
                <div key={v.id || i} className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-2">
                  <Input placeholder="Variant name (e.g. Red / Large)" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} className="!w-48" />
                  <Input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="!w-28" />
                  <Input type="number" placeholder="Price override" value={v.price ?? ""} onChange={(e) => updateVariant(i, "price", e.target.value)} className="!w-32" />
                  <Input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} className="!w-24" />
                  <button type="button" onClick={() => removeVariant(i)} style={{ color: "var(--color-rose)" }}><X size={15} /></button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" variant="gold" className="w-full">
            {modal?.mode === "add" ? "Add product" : "Save changes"}
          </Button>
        </form>
      </Modal>

      <Modal open={csvOpen} onClose={() => setCsvOpen(false)} title="Bulk product upload">
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <Upload size={22} className="mx-auto text-ink-muted" />
          <p className="mt-2 text-sm font-medium text-ink">Drop your CSV/Excel file here</p>
          <p className="mt-1 text-xs text-ink-muted">Columns: name, category, mrp, price, stock, moq, tierPricing, image URL</p>
        </div>
        <Button onClick={simulateBulkUpload} className="mt-4 w-full">Simulate import</Button>
      </Modal>
    </DashboardShell>
  );
}
