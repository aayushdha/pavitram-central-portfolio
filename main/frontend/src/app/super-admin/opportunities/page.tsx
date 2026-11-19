"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { adminApi, type ApiOpportunity } from "@/lib/admin/api";
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminTextarea,
  AdminToggle,
  AdminModal,
  AdminBadge,
  AdminStringArrayEditor,
  AdminStepListEditor,
  ConfirmDeleteButton,
} from "@/components/admin/admin-ui";

const EMPTY: Partial<ApiOpportunity> = {
  slug: "",
  title: "",
  hindi: "",
  label: "",
  icon: "Sparkles",
  intro: "",
  benefits: [],
  steps: [],
  order: 0,
  isPublished: true,
};

export default function AdminOpportunitiesPage() {
  const [items, setItems] = useState<ApiOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiOpportunity | null>(null);
  const [form, setForm] = useState<Partial<ApiOpportunity>>(EMPTY);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminApi.opportunities
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

  function openEdit(item: ApiOpportunity) {
    setEditing(item);
    setForm({ ...item });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const updated = await adminApi.opportunities.update(editing.id, form);
        setItems((prev) => prev.map((i) => (i.id === editing.id ? updated : i)));
      } else {
        const created = await adminApi.opportunities.create(form);
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
      await adminApi.opportunities.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Opportunities</h1>
          <p className="mt-1 text-sm text-mist">Consumer, Merchant, Investor and Career opportunity pages.</p>
        </div>
        <AdminButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Opportunity
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
                    <p className="font-semibold text-ink">{item.title}</p>
                    <span className="text-xs text-mist">/opportunities/{item.slug}</span>
                    {!item.isPublished && <AdminBadge>Hidden</AdminBadge>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-mist">{item.intro}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <a href={`/opportunities/${item.slug}`} target="_blank" rel="noreferrer">
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
        title={editing ? `Edit ${editing.title}` : "New Opportunity"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Slug (URL path)"
              value={form.slug ?? ""}
              required
              onChange={(v) => setForm((p) => ({ ...p, slug: v }))}
            />
            <AdminInput
              label="Icon name (Lucide)"
              value={form.icon ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, icon: v }))}
            />
            <AdminInput
              label="Title (e.g. As a Consumer)"
              value={form.title ?? ""}
              required
              onChange={(v) => setForm((p) => ({ ...p, title: v }))}
            />
            <AdminInput
              label="Title (Hindi)"
              value={form.hindi ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, hindi: v }))}
            />
            <AdminInput
              label="Short Label (e.g. Consumer)"
              value={form.label ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, label: v }))}
            />
          </div>

          <AdminTextarea
            label="Intro Paragraph"
            value={form.intro ?? ""}
            rows={4}
            onChange={(v) => setForm((p) => ({ ...p, intro: v }))}
          />

          <AdminStringArrayEditor
            label="Benefits"
            items={form.benefits ?? []}
            onChange={(v) => setForm((p) => ({ ...p, benefits: v }))}
          />
          <AdminStepListEditor
            label="Steps (title / description)"
            items={(form.steps as any) ?? []}
            onChange={(v) => setForm((p) => ({ ...p, steps: v as any }))}
            hasNum={false}
            descKey="body"
          />

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
              Save Opportunity
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
