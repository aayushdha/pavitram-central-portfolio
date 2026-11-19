"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, GripVertical } from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminTextarea,
  AdminToggle,
  AdminModal,
  AdminBadge,
  ConfirmDeleteButton,
} from "./admin-ui";

export type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean";
  required?: boolean;
  rows?: number;
};

type BaseItem = {
  id: string;
  order?: number;
  isPublished?: boolean;
  [key: string]: any;
};

export function GenericCrudPage<T extends BaseItem>({
  title,
  description,
  fields,
  titleField,
  subtitleField,
  api,
  newItemDefaults,
}: {
  title: string;
  description: string;
  fields: FieldConfig[];
  titleField: string;
  subtitleField?: string;
  api: {
    list: () => Promise<T[]>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    remove: (id: string) => Promise<unknown>;
  };
  newItemDefaults: Partial<T>;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Partial<T>>({});
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api
      .list()
      .then((data) => setItems(data))
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...newItemDefaults, order: items.length });
    setModalOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    setForm({ ...item });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const updated = await api.update(editing.id, form);
        setItems((prev) => prev.map((i) => (i.id === editing.id ? updated : i)));
      } else {
        const created = await api.create(form);
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
      await api.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-mist">{description}</p>
        </div>
        <AdminButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add New
        </AdminButton>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {!loading && (
        <div className="mt-6 space-y-3">
          {items.length === 0 && (
            <AdminCard className="p-8 text-center text-sm text-mist">
              Nothing here yet. Click "Add New" to create the first entry.
            </AdminCard>
          )}
          {[...items]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((item) => (
              <AdminCard key={item.id} className="flex items-center gap-4 p-4">
                <GripVertical className="h-4 w-4 shrink-0 text-mist/50" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-ink">{item[titleField]}</p>
                    {item.isPublished === false && <AdminBadge tone="default">Hidden</AdminBadge>}
                  </div>
                  {subtitleField && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-mist">{item[subtitleField]}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <AdminButton size="sm" variant="secondary" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </AdminButton>
                  <ConfirmDeleteButton onConfirm={() => handleDelete(item.id)} />
                </div>
              </AdminCard>
            ))}
        </div>
      )}

      <AdminModal title={editing ? `Edit ${title}` : `New ${title}`} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          {fields.map((f) => {
            if (f.type === "boolean") {
              return (
                <AdminToggle
                  key={f.key}
                  label={f.label}
                  checked={Boolean(form[f.key])}
                  onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                />
              );
            }
            if (f.type === "textarea") {
              return (
                <AdminTextarea
                  key={f.key}
                  label={f.label}
                  value={form[f.key] ?? ""}
                  rows={f.rows || 3}
                  required={f.required}
                  onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                />
              );
            }
            return (
              <AdminInput
                key={f.key}
                label={f.label}
                type={f.type === "number" ? "number" : "text"}
                value={form[f.key] ?? (f.type === "number" ? 0 : "")}
                required={f.required}
                onChange={(v) => setForm((p) => ({ ...p, [f.key]: f.type === "number" ? Number(v) : v }))}
              />
            );
          })}
          <AdminToggle
            label="Published (visible on the live site)"
            checked={form.isPublished !== false}
            onChange={(v) => setForm((p) => ({ ...p, isPublished: v }))}
          />

          {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={handleSave} loading={saving}>
              Save
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
