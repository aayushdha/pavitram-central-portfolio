"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, ToggleRight, Warehouse, Trash2, ExternalLink } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import SectionCard from "@/components/SectionCard";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, Input, TextArea, Select, Button } from "@/components/Field";
import { vendorNav } from "@/lib/vendorNav";
import { useStore } from "@/lib/store";
import api from "@/lib/api";

export default function StoreSetupPage() {
  const { state, auth, saveStoreProfile, toggleStoreChannel, addWarehouse, removeWarehouse, notify, vendors } = useStore();
  // BUGFIX: Vendor.state (GST origin state) had no form anywhere to set it —
  // see the fuller comment on the registration page. Lets an already-
  // registered vendor (who signed up before this fix existed) set/fix it.
  const vendorRecord = state.vendors.find((v) => v.id === auth?.vendorId);
  const [gstState, setGstState] = useState(vendorRecord?.state || "");
  useEffect(() => setGstState(vendorRecord?.state || ""), [vendorRecord?.state]);
  const saveGstState = (e) => {
    e.preventDefault();
    if (!auth?.vendorId) return;
    vendors.update(auth.vendorId, { state: gstState }, { message: "Business state saved" });
  };
  const sp = state.storeProfile;
  const [form, setForm] = useState({
    name: sp.name || "",
    website: sp.social?.website || "",
    instagram: sp.social?.instagram || "",
    tagline: sp.tagline || "",
    about: sp.about || "",
  });
  const [whOpen, setWhOpen] = useState(false);
  const [whForm, setWhForm] = useState({ label: "", pincode: "", priority: "B2C + B2B" });

  const saveProfile = (e) => {
    e.preventDefault();
    saveStoreProfile({ name: form.name, tagline: form.tagline, about: form.about, social: { website: form.website, instagram: form.instagram } });
  };

  const [uploading, setUploading] = useState("");
  const uploadImage = async (file, field) => {
    if (!file) return;
    setUploading(field);
    try {
      const uploaded = await api.uploads.uploadOne(file, "vendor-brand");
      saveStoreProfile({ [field]: uploaded.url });
    } catch {
      notify("Upload failed — please try again.", "error");
    } finally {
      setUploading("");
    }
  };

  const toggleChannel = (c) => toggleStoreChannel(c);

  const addWarehouseSubmit = (e) => {
    e.preventDefault();
    addWarehouse(whForm);
    setWhForm({ label: "", pincode: "", priority: "B2C + B2B" });
    setWhOpen(false);
  };

  const removeWarehouseClick = (id) => removeWarehouse(id);

  return (
    <DashboardShell
      title="Store Setup & Brand Identity"
      roleLabel="Vendor"
      accent="var(--color-gold)"
      nav={vendorNav}
      activeHref="/vendor/store"
      requireRole="vendor"
    >
      <SectionCard icon={Store} title="Custom store profile" description="Logo, cover image, social links, and an 'About the Brand' description for your virtual storefront page.">
        {auth?.vendorId && (
          <Link
            href={`/store/${auth.vendorId}`}
            target="_blank"
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
            style={{ borderColor: "var(--color-gold)", color: "var(--color-gold)" }}
          >
            <ExternalLink size={13} /> View your public storefront
          </Link>
        )}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {[
            { field: "logoUrl", label: "Logo" },
            { field: "coverUrl", label: "Cover image" },
          ].map(({ field, label }) => (
            <div key={field} className="rounded-xl border border-dashed border-line p-3">
              <p className="text-xs font-medium text-ink">{label}</p>
              {state.storeProfile[field] ? (
                <img src={state.storeProfile[field]} alt={label} className="mt-2 h-20 w-full rounded-lg object-cover" />
              ) : (
                <p className="mt-2 text-[11px] text-ink-muted">Not uploaded yet.</p>
              )}
              <label className="mt-2 inline-block cursor-pointer text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
                {uploading === field ? "Uploading…" : state.storeProfile[field] ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading === field}
                  onChange={(e) => uploadImage(e.target.files?.[0], field)}
                />
              </label>
            </div>
          ))}
        </div>
        <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-2">
          <Field label="Store name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Website"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
          <Field label="Instagram handle"><Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></Field>
          <Field label="Tagline"><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <Field label="About the brand">
              <TextArea rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="gold">Save store profile</Button>
          </div>
        </form>
      </SectionCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SectionCard icon={ToggleRight} title="Channel toggle" description="Choose whether your store sells to B2C, B2B, or both. Click to toggle.">
          <div className="flex gap-2">
            {["B2C", "B2B"].map((c) => (
              <button key={c} onClick={() => toggleChannel(c)}>
                <Badge tone={sp.channels.includes(c) ? (c === "B2B" ? "jade" : "gold") : "ink"}>
                  {c} {sp.channels.includes(c) ? "Enabled" : "Disabled"}
                </Badge>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Warehouse} title="Warehouse configurations" description="Single or multiple pickup addresses for logistics partners, tagged by channel priority.">
          <div className="space-y-2">
            {sp.warehouses.length === 0 && <p className="text-xs text-ink-muted">No warehouses added yet.</p>}
            {sp.warehouses.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs">
                <div>
                  <p className="font-medium text-ink">{w.label}</p>
                  <p className="text-ink-muted">Pincode {w.pincode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="ink">{w.priority}</Badge>
                  <button onClick={() => removeWarehouseClick(w.id)} style={{ color: "var(--color-rose)" }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setWhOpen(true)} className="mt-3 text-xs font-semibold" style={{ color: "var(--color-gold)" }}>+ Add another warehouse</button>
        </SectionCard>
      </div>

      <Modal open={whOpen} onClose={() => setWhOpen(false)} title="Add warehouse">
        <form onSubmit={addWarehouseSubmit} className="space-y-4">
          <Field label="Label" required><Input required value={whForm.label} onChange={(e) => setWhForm({ ...whForm, label: e.target.value })} placeholder="Bhuj Primary Warehouse" /></Field>
          <Field label="Pincode" required><Input required value={whForm.pincode} onChange={(e) => setWhForm({ ...whForm, pincode: e.target.value })} placeholder="370001" /></Field>
          <Field label="Channel priority">
            <Select value={whForm.priority} onChange={(e) => setWhForm({ ...whForm, priority: e.target.value })}>
              <option>B2C + B2B</option><option>B2C only</option><option>B2B only</option>
            </Select>
          </Field>
          <Button type="submit" className="w-full">Add warehouse</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
