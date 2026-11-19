"use client";

import { useEffect, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminSelect,
  AdminModal,
  AdminInput,
  ConfirmDeleteButton,
} from "@/components/admin/admin-ui";
import { useAuth } from "@/components/auth/auth-provider";
import type { AuthUser } from "@/lib/auth/types";

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [items, setItems] = useState<AuthUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", password: "", role: "ADMIN" });
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);
    adminApi.users
      .list({ search: search || undefined })
      .then((res) => setItems(res.data))
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateField(id: string, field: "role" | "accountStatus", value: string) {
    try {
      const updated = await adminApi.users.update(id, { [field]: value } as any);
      setItems((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (e: any) {
      setError(e.message || "Failed to update user");
    }
  }

  async function remove(id: string) {
    try {
      await adminApi.users.remove(id);
      setItems((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete user");
    }
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const created = await adminApi.users.create(newUser);
      setItems((prev) => [created, ...prev]);
      setCreateOpen(false);
      setNewUser({ name: "", email: "", phone: "", password: "", role: "ADMIN" });
    } catch (e: any) {
      setError(e.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Users & Roles</h1>
          <p className="mt-1 text-sm text-mist">
            Every registered account. Promote trusted people to Admin to give them access to this panel.
          </p>
        </div>
        <AdminButton onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add Admin
        </AdminButton>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-ink/12 bg-white px-3 py-2 sm:w-72">
        <Search className="h-3.5 w-3.5 text-mist" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search name, email, phone…"
          className="w-full text-sm outline-none"
        />
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {!loading && (
        <div className="mt-5 space-y-3">
          {items.map((u) => (
            <AdminCard key={u.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{u.name || "(no name yet)"}</p>
                  {u.role !== "USER" && <AdminBadge tone="gold">{u.role?.replaceAll("_", " ")}</AdminBadge>}
                </div>
                <p className="text-sm text-mist">
                  {u.email} · {u.phone}
                </p>
              </div>
              <div className="w-40">
                <AdminSelect
                  value={u.role || "USER"}
                  onChange={(v) => updateField(u.id, "role", v)}
                  options={ROLE_OPTIONS}
                />
              </div>
              <div className="w-36">
                <AdminSelect
                  value={u.accountStatus || "ACTIVE"}
                  onChange={(v) => updateField(u.id, "accountStatus", v)}
                  options={STATUS_OPTIONS}
                />
              </div>
              {u.id !== me?.id && <ConfirmDeleteButton onConfirm={() => remove(u.id)} />}
            </AdminCard>
          ))}
        </div>
      )}

      <AdminModal title="Add Admin Account" open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <AdminInput label="Full Name" value={newUser.name} onChange={(v) => setNewUser((p) => ({ ...p, name: v }))} required />
          <AdminInput label="Email" value={newUser.email} onChange={(v) => setNewUser((p) => ({ ...p, email: v }))} required />
          <AdminInput label="Phone" value={newUser.phone} onChange={(v) => setNewUser((p) => ({ ...p, phone: v }))} required />
          <AdminInput
            label="Temporary Password"
            type="password"
            value={newUser.password}
            onChange={(v) => setNewUser((p) => ({ ...p, password: v }))}
            required
          />
          <AdminSelect
            label="Role"
            value={newUser.role}
            onChange={(v) => setNewUser((p) => ({ ...p, role: v }))}
            options={ROLE_OPTIONS.filter((r) => r.value !== "USER")}
          />
          {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={handleCreate} loading={creating}>
              Create Account
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
