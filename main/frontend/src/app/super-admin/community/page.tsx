"use client";

import { useEffect, useState } from "react";
import { Check, X as XIcon, Search } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { AdminCard, AdminButton, AdminBadge, ConfirmDeleteButton } from "@/components/admin/admin-ui";

type CommunityMember = {
  id: string;
  fullName: string;
  mobileNumber: string;
  profession: string;
  designation: string;
  organization: string;
  location: string;
  city: string;
  state: string;
  reference?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

const STATUS_TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export default function AdminCommunityPage() {
  const [items, setItems] = useState<CommunityMember[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>("PENDING");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    adminApi.community
      .list({ status: status === "ALL" ? undefined : status, search: search || undefined })
      .then((res) => {
        setItems(res.data);
        setCounts(res.counts);
      })
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(id: string, next: "APPROVED" | "REJECTED") {
    try {
      await adminApi.community.updateStatus(id, next);
      load();
    } catch (e: any) {
      setError(e.message || "Failed to update");
    }
  }

  async function remove(id: string) {
    try {
      await adminApi.community.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Join Requests</h1>
      <p className="mt-1 text-sm text-mist">
        People who submitted the "Join the Community" form on the public site.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setStatus(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              status === t ? "bg-navy text-white" : "bg-white text-mist hover:bg-haze"
            }`}
          >
            {t === "ALL" ? `All (${counts.total})` : `${t} (${counts[t.toLowerCase() as "pending"] ?? 0})`}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-ink/12 bg-white px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-mist" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name, city…"
            className="w-40 text-sm outline-none"
          />
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {!loading && (
        <div className="mt-5 space-y-3">
          {items.length === 0 && (
            <AdminCard className="p-8 text-center text-sm text-mist">No submissions in this view.</AdminCard>
          )}
          {items.map((m) => (
            <AdminCard key={m.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-bold text-ink">{m.fullName}</p>
                    <AdminBadge tone={m.status === "PENDING" ? "warning" : m.status === "APPROVED" ? "success" : "danger"}>
                      {m.status}
                    </AdminBadge>
                  </div>
                  <p className="mt-1 text-sm text-mist">
                    {m.designation} at {m.organization} · {m.profession}
                  </p>
                  <p className="mt-1 text-sm text-mist">
                    📍 {m.location}, {m.city}, {m.state} &nbsp;·&nbsp; 📞 {m.mobileNumber}
                  </p>
                  {m.reference && <p className="mt-1 text-xs text-mist">Reference: {m.reference}</p>}
                  <p className="mt-1 text-[11px] text-mist/70">
                    Submitted {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {m.status !== "APPROVED" && (
                    <AdminButton size="sm" variant="secondary" onClick={() => updateStatus(m.id, "APPROVED")}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </AdminButton>
                  )}
                  {m.status !== "REJECTED" && (
                    <AdminButton size="sm" variant="ghost" onClick={() => updateStatus(m.id, "REJECTED")}>
                      <XIcon className="h-3.5 w-3.5" /> Reject
                    </AdminButton>
                  )}
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
