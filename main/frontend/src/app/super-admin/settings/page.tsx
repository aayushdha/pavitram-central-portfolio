"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/admin/api";
import { AdminCard, AdminButton, AdminInput, AdminTextarea } from "@/components/admin/admin-ui";

type Setting = { id: string; key: string; value: string; group: string; label: string; type: string };

const GROUP_LABELS: Record<string, string> = {
  general: "General",
  contact: "Contact Details",
  social: "Social Links",
  footer: "Footer",
  integrations: "Integrations",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.settings
      .list()
      .then((data) => setSettings(data))
      .catch((e) => setError(e.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Setting[]>();
    for (const s of settings) {
      const list = map.get(s.group) ?? [];
      list.push(s);
      map.set(s.group, list);
    }
    return Array.from(map.entries());
  }, [settings]);

  function updateValue(key: string, value: string) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  }

  async function handleSaveAll() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.settings.bulkUpdate(
        settings.map((s) => ({ key: s.key, value: s.value, group: s.group, label: s.label, type: s.type })),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Site Settings</h1>
          <p className="mt-1 text-sm text-mist">
            Logo, contact details, social links and footer text used across the whole site.
          </p>
        </div>
        <AdminButton onClick={handleSaveAll} loading={saving}>
          Save All Changes
        </AdminButton>
      </div>

      {saved && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Settings saved — changes are live on the site immediately.
        </p>
      )}
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {!loading && (
        <div className="mt-6 space-y-6">
          {grouped.map(([group, items]) => (
            <AdminCard key={group} className="p-5">
              <h2 className="font-display text-lg font-bold text-ink">
                {GROUP_LABELS[group] || group}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {items.map((s) =>
                  s.type === "textarea" ? (
                    <div key={s.key} className="sm:col-span-2">
                      <AdminTextarea
                        label={s.label || s.key}
                        value={s.value}
                        rows={2}
                        onChange={(v) => updateValue(s.key, v)}
                      />
                    </div>
                  ) : (
                    <AdminInput
                      key={s.key}
                      label={s.label || s.key}
                      value={s.value}
                      onChange={(v) => updateValue(s.key, v)}
                    />
                  ),
                )}
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
