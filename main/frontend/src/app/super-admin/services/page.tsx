"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { adminApi, type ApiService } from "@/lib/admin/api";
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminTextarea,
  AdminToggle,
  AdminModal,
  AdminBadge,
  AdminStringArrayEditor,
  AdminFeatureListEditor,
  AdminStepListEditor,
  ConfirmDeleteButton,
} from "@/components/admin/admin-ui";

const EMPTY: Partial<ApiService> = {
  slug: "",
  name: "",
  hindi: "",
  tagline: "",
  heroIcon: "Sparkles",
  aboutTitle: "",
  aboutP1: "",
  aboutP2: "",
  pills: [],
  whyUs: [],
  features: [],
  steps: [],
  dashboardDescription: "",
  dashboardHref: "",
  dashboardExternal: false,
  dashboardSso: false,
  dashboardAccent: "from-gold/20 to-transparent",
  showOnDashboard: true,
  order: 0,
  isPublished: true,
};

export default function AdminServicesPage() {
  const [items, setItems] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiService | null>(null);
  const [form, setForm] = useState<Partial<ApiService>>(EMPTY);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminApi.services
      .list()
      .then(setItems)
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, order: items.length });
    setModalOpen(true);
  }

  function openEdit(item: ApiService) {
    setEditing(item);
    setForm({ ...item });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const updated = await adminApi.services.update(editing.id, form);
        setItems((prev) => prev.map((i) => (i.id === editing.id ? updated : i)));
      } else {
        const created = await adminApi.services.create(form);
        setItems((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await adminApi.services.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Services</h1>
          <p className="mt-1 text-sm text-mist">
            All 13 Pavitram service pages — hero content, features, steps, and dashboard visibility.
          </p>
        </div>
        <AdminButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Service
        </AdminButton>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {!loading && (
        <div className="mt-6 space-y-3">
          {[...items]
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <AdminCard key={item.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <span className="text-xs text-mist">/services/{item.slug}</span>
                    {!item.isPublished && <AdminBadge>Hidden</AdminBadge>}
                    {item.showOnDashboard && <AdminBadge tone="gold">On Dashboard</AdminBadge>}
                    {item.dashboardExternal && <AdminBadge tone="warning">External / SSO</AdminBadge>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-mist">{item.tagline}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <a href={`/services/${item.slug}`} target="_blank" rel="noreferrer">
                    <AdminButton size="sm" variant="ghost">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </AdminButton>
                  </a>
                  <AdminButton size="sm" variant="secondary" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </AdminButton>
                  <ConfirmDeleteButton onConfirm={() => handleDelete(item.id)} />
                </div>
              </AdminCard>
            ))}
        </div>
      )}

      <AdminModal
        title={editing ? `Edit ${editing.name}` : "New Service"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Slug (URL path — /services/…)"
              value={form.slug ?? ""}
              required
              onChange={(v) => setForm((p) => ({ ...p, slug: v }))}
            />
            <AdminInput
              label="Icon name (Lucide, e.g. ShoppingBag)"
              value={form.heroIcon ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, heroIcon: v }))}
            />
            <AdminInput
              label="Name (English)"
              value={form.name ?? ""}
              required
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <AdminInput
              label="Name (Hindi)"
              value={form.hindi ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, hindi: v }))}
            />
          </div>

          <AdminTextarea
            label="Tagline"
            value={form.tagline ?? ""}
            rows={2}
            onChange={(v) => setForm((p) => ({ ...p, tagline: v }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="About Section Title"
              value={form.aboutTitle ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, aboutTitle: v }))}
            />
          </div>
          <AdminTextarea
            label="About Paragraph 1"
            value={form.aboutP1 ?? ""}
            rows={3}
            onChange={(v) => setForm((p) => ({ ...p, aboutP1: v }))}
          />
          <AdminTextarea
            label="About Paragraph 2"
            value={form.aboutP2 ?? ""}
            rows={3}
            onChange={(v) => setForm((p) => ({ ...p, aboutP2: v }))}
          />

          <AdminStringArrayEditor
            label="Pills (short highlight tags)"
            items={form.pills ?? []}
            onChange={(v) => setForm((p) => ({ ...p, pills: v }))}
          />
          <AdminStringArrayEditor
            label="Why Choose Us (bullet points)"
            items={form.whyUs ?? []}
            onChange={(v) => setForm((p) => ({ ...p, whyUs: v }))}
          />
          <AdminFeatureListEditor
            label="Features (icon / title / description)"
            items={form.features ?? []}
            onChange={(v) => setForm((p) => ({ ...p, features: v }))}
          />
          <AdminStepListEditor
            label="How It Works — Steps (number / title / description)"
            items={form.steps ?? []}
            onChange={(v) => setForm((p) => ({ ...p, steps: v as any }))}
            hasNum
            descKey="desc"
          />

          <div className="rounded-xl border border-ink/10 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gold">Dashboard Card Settings</p>
            <div className="space-y-4">
              <AdminTextarea
                label="Dashboard Card Description"
                value={form.dashboardDescription ?? ""}
                rows={2}
                onChange={(v) => setForm((p) => ({ ...p, dashboardDescription: v }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminInput
                  label="Dashboard Link (href)"
                  value={form.dashboardHref ?? ""}
                  onChange={(v) => setForm((p) => ({ ...p, dashboardHref: v }))}
                  hint="e.g. /services/mart or /sso/properties"
                />
                <AdminInput
                  label="Accent gradient classes"
                  value={form.dashboardAccent ?? ""}
                  onChange={(v) => setForm((p) => ({ ...p, dashboardAccent: v }))}
                  hint="Tailwind classes, e.g. from-emerald-500/20 to-transparent"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <AdminToggle
                  label="Show on Dashboard"
                  checked={Boolean(form.showOnDashboard)}
                  onChange={(v) => setForm((p) => ({ ...p, showOnDashboard: v }))}
                />
                <AdminToggle
                  label="External Link"
                  checked={Boolean(form.dashboardExternal)}
                  onChange={(v) => setForm((p) => ({ ...p, dashboardExternal: v }))}
                />
                <AdminToggle
                  label="SSO Handoff"
                  checked={Boolean(form.dashboardSso)}
                  onChange={(v) => setForm((p) => ({ ...p, dashboardSso: v }))}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Display Order"
              type="number"
              value={form.order ?? 0}
              onChange={(v) => setForm((p) => ({ ...p, order: Number(v) }))}
            />
            <AdminToggle
              label="Published (visible on live site)"
              checked={form.isPublished !== false}
              onChange={(v) => setForm((p) => ({ ...p, isPublished: v }))}
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-ink/8 pt-4">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={handleSave} loading={saving}>
              Save Service
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
