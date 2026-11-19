"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, MapPin } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import { Field, Input, Button } from "@/components/Field";
import { accountNav } from "@/lib/accountNav";
import { useStore } from "@/lib/store";

// BUGFIX: this form used to collect only { label, pincode } — every address
// saved from this page (the guide's Section 1.10 "Saved Addresses") had no
// receiver name, phone, street, area, or city/state at all, even though the
// backend has always supported them (and checkout's own separate inline
// add-address form already collects the full set). An address added here
// was silently unusable for real delivery. Also added: Edit, which the
// guide explicitly promises ("Each saved address has Edit and Delete
// options") but which never existed on this page at all.
const emptyForm = { label: "", fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "" };

export default function AddressesPage() {
  const { state, savedAddresses, notify } = useStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      label: a.label || "",
      fullName: a.fullName || "",
      phone: a.phone || "",
      line1: a.line1 || "",
      line2: a.line2 || "",
      landmark: a.landmark || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || "",
    });
    setOpen(true);
  };

  const saveAddress = (e) => {
    e.preventDefault();
    if (editingId) {
      savedAddresses.update(editingId, { ...form }, { message: "Address updated" });
    } else {
      savedAddresses.add({ ...form, isDefault: state.savedAddresses.length === 0 }, { message: "Address added" });
    }
    setOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const makeDefault = (id) => {
    state.savedAddresses.forEach((a) => savedAddresses.update(a.id, { isDefault: a.id === id }, { notify: false }));
    notify("Default address updated");
  };

  const remove = (id) => savedAddresses.remove(id, { message: "Address removed" });

  return (
    <DashboardShell
      title="Saved Addresses"
      roleLabel="My Account"
      accent="var(--color-gold)"
      nav={accountNav}
      activeHref="/account/addresses"
      requireRole="customer"
    >
      <div className="mb-4 flex justify-end">
        <Button variant="gold" onClick={openAdd}><Plus size={15} /> Add address</Button>
      </div>

      {state.savedAddresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-12 text-center">
          <MapPin className="mx-auto text-ink-muted" size={22} />
          <p className="mt-2 font-display text-base font-semibold text-ink">No addresses saved</p>
          <p className="mt-1 text-sm text-ink-muted">Add one to speed up checkout next time.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.savedAddresses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-line bg-paper-raised p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-ink">{a.label}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(a)} className="text-ink-muted hover:text-ink"><Pencil size={14} /></button>
                  <button onClick={() => remove(a.id)} style={{ color: "var(--color-rose)" }}><Trash2 size={14} /></button>
                </div>
              </div>
              {a.fullName && <p className="mt-1 text-xs text-ink">{a.fullName}{a.phone ? ` · ${a.phone}` : ""}</p>}
              <p className="mt-1 text-xs text-ink-muted">
                {[a.line1, a.line2, a.landmark, a.city, a.state].filter(Boolean).join(", ")}
                {a.pincode ? ` — ${a.pincode}` : ""}
              </p>
              <div className="mt-3">
                {a.isDefault ? (
                  <Badge tone="gold">Default address</Badge>
                ) : (
                  <button onClick={() => makeDefault(a.id)} className="text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit address" : "Add address"}>
        <form onSubmit={saveAddress} className="grid gap-3 sm:grid-cols-2">
          <Field label="Label" required><Input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Office…" /></Field>
          <Field label="Full name" required><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Receiver's name" /></Field>
          <Field label="Phone number" required><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" /></Field>
          <Field label="House / Flat / Street" required className="sm:col-span-2">
            <Input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Flat no., building, street" />
          </Field>
          <Field label="Area / Locality" className="sm:col-span-2">
            <Input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          </Field>
          <Field label="Landmark"><Input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Nearby landmark (optional)" /></Field>
          <Field label="City" required><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="State" required><Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
          <Field label="Pincode" required><Input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="380001" /></Field>
          <Button type="submit" className="w-full sm:col-span-2">{editingId ? "Save changes" : "Save address"}</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
