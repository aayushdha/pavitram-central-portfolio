"use client";

import { useEffect, useState } from "react";
import { Mail, Search } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { AdminCard, AdminButton, AdminBadge, AdminSelect, ConfirmDeleteButton } from "@/components/admin/admin-ui";

type ContactMessage = {
  id: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "RESOLVED";
  createdAt: string;
};

const STATUS_TABS = ["ALL", "NEW", "READ", "RESOLVED"] as const;

export default function AdminMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>("NEW");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    adminApi.messages
      .list({ status: status === "ALL" ? undefined : status, search: search || undefined })
      .then((res) => setItems(res.data))
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(id: string, next: string) {
    try {
      await adminApi.messages.updateStatus(id, next);
      load();
    } catch (e: any) {
      setError(e.message || "Failed to update");
    }
  }

  async function remove(id: string) {
    try {
      await adminApi.messages.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Contact Messages</h1>
      <p className="mt-1 text-sm text-mist">Messages submitted through the Contact page form.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setStatus(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              status === t ? "bg-navy text-white" : "bg-white text-mist hover:bg-haze"
            }`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-ink/12 bg-white px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-mist" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search…"
            className="w-40 text-sm outline-none"
          />
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {!loading && (
        <div className="mt-5 space-y-3">
          {items.length === 0 && (
            <AdminCard className="p-8 text-center text-sm text-mist">No messages in this view.</AdminCard>
          )}
          {items.map((m) => (
            <AdminCard key={m.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gold" />
                    <p className="font-display text-lg font-bold text-ink">{m.subject}</p>
                    <AdminBadge tone={m.status === "NEW" ? "gold" : m.status === "RESOLVED" ? "success" : "default"}>
                      {m.status}
                    </AdminBadge>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {m.name} <span className="font-normal text-mist">· {m.contact}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{m.message}</p>
                  <p className="mt-1 text-[11px] text-mist/70">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="w-36">
                    <AdminSelect
                      value={m.status}
                      onChange={(v) => updateStatus(m.id, v)}
                      options={[
                        { value: "NEW", label: "New" },
                        { value: "READ", label: "Read" },
                        { value: "RESOLVED", label: "Resolved" },
                      ]}
                    />
                  </div>
                  <ConfirmDeleteButton onConfirm={() => remove(m.id)} />
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
