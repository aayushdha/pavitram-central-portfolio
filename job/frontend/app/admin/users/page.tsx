"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, stageTone } from "@/components/ui/Badge";
import { userAccounts } from "@/lib/data";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Search, ShieldCheck, Ban, MoreHorizontal } from "lucide-react";

const types = ["All", "Job Seeker", "Employer"] as const;

type Account = (typeof userAccounts)[number];

/** Status an account gets when an admin verifies / reactivates it. */
function approvedStatus(u: Account) {
  return u.type === "Employer" ? "Verified" : "Active";
}

export default function AdminUsersPage() {
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  // Header search sends users here with ?q=... — use it until the user types something else.
  const urlQuery = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("q") ?? "",
    () => ""
  );
  const query = typedQuery ?? urlQuery;
  const setQuery = setTypedQuery;
  const [selected, setSelected] = useState<string[]>([]);
  const toast = useToast();
  const [accounts, setAccounts] = useState<Account[]>(userAccounts);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ ids: string[]; action: "verify" | "suspend" } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the row menu when clicking elsewhere.
  useEffect(() => {
    if (!menuFor) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuFor]);

  function applyAction() {
    if (!confirm) return;
    const { ids, action } = confirm;
    setAccounts((list) =>
      list.map((u) =>
        ids.includes(u.id)
          ? { ...u, status: action === "verify" ? approvedStatus(u) : "Suspended" }
          : u
      )
    );
    toast(
      `${ids.length} account${ids.length > 1 ? "s" : ""} ${action === "verify" ? "verified" : "suspended"}.`,
      action === "verify" ? "success" : "info"
    );
    setSelected((s) => s.filter((id) => !ids.includes(id)));
    setConfirm(null);
  }

  const rows = accounts.filter(
    (u) =>
      (type === "All" || u.type === type) &&
      (!query || u.name.toLowerCase().includes(query.toLowerCase()))
  );

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div>
      <PageHeader
        title="Users & employer KYC"
        subtitle="Search, verify, or suspend accounts. Select many at once for bulk actions."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 flex-1">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or company"
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                type === t ? "bg-ink-900 text-white border-ink-900" : "border-border text-muted hover:border-brand-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 rounded-xl bg-brand-50 border border-brand-100 px-4 py-2.5 text-sm">
          <span className="font-medium text-brand-700">{selected.length} selected</span>
          <button onClick={() => setConfirm({ ids: selected, action: "verify" })} className="text-brand-700 font-semibold flex items-center gap-1"><ShieldCheck size={14} /> Bulk verify</button>
          <button onClick={() => setConfirm({ ids: selected, action: "suspend" })} className="text-bad-500 font-semibold flex items-center gap-1"><Ban size={14} /> Bulk suspend</button>
          <button onClick={() => setSelected([])} className="ml-auto text-muted hover:text-ink text-xs font-medium">Clear</button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-border">
              <th className="px-5 py-3 font-medium w-10"></th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium">Flags</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-background/60">
                <td className="px-5 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.includes(u.id)}
                    onChange={() => toggle(u.id)}
                    className="accent-[var(--brand-500)]"
                  />
                </td>
                <td className="px-5 py-3.5 font-medium text-ink">{u.name}</td>
                <td className="px-5 py-3.5 text-muted">{u.type}</td>
                <td className="px-5 py-3.5"><Badge tone={stageTone(u.status)}>{u.status}</Badge></td>
                <td className="px-5 py-3.5 text-muted">{u.joined}</td>
                <td className="px-5 py-3.5">
                  {u.flags > 0 ? <Badge tone="bad">{u.flags} reports</Badge> : <span className="text-muted">—</span>}
                </td>
                <td className="px-5 py-3.5 text-right relative">
                  <button
                    onClick={() => setMenuFor((m) => (m === u.id ? null : u.id))}
                    aria-label={`Actions for ${u.name}`}
                    className="text-muted hover:text-ink"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {menuFor === u.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-5 top-10 z-10 w-44 rounded-xl border border-border bg-surface shadow-lg py-1 text-left"
                    >
                      {u.status !== approvedStatus(u) && (
                        <button
                          onClick={() => {
                            setMenuFor(null);
                            setConfirm({ ids: [u.id], action: "verify" });
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-background"
                        >
                          <ShieldCheck size={14} /> {u.status === "Suspended" ? "Reactivate" : "Verify"}
                        </button>
                      )}
                      {u.status !== "Suspended" && (
                        <button
                          onClick={() => {
                            setMenuFor(null);
                            setConfirm({ ids: [u.id], action: "suspend" });
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-bad-500 hover:bg-background"
                        >
                          <Ban size={14} /> Suspend
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">No accounts match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={applyAction}
        title={confirm?.action === "verify" ? "Verify accounts?" : "Suspend accounts?"}
        message={
          confirm?.action === "verify"
            ? `${confirm.ids.length} account${confirm.ids.length > 1 ? "s" : ""} will be marked as verified/active.`
            : `${confirm?.ids.length ?? 0} account${(confirm?.ids.length ?? 0) > 1 ? "s" : ""} will be suspended and lose access until reactivated.`
        }
        confirmLabel={confirm?.action === "verify" ? "Verify" : "Suspend"}
        danger={confirm?.action === "suspend"}
      />
    </div>
  );
}
