"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/auth/api";
import { showToast } from "@/components/site";

const fieldClass =
  "w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function ProfilePage() {
  const { user, tokenProfile, updateProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    avatarUrl: "",
    address: "",
    city: "",
    state: "",
    profession: "",
    designation: "",
    organization: "",
    reference: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      avatarUrl: user.avatarUrl || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      profession: user.profession || "",
      designation: user.designation || "",
      organization: user.organization || "",
      reference: user.reference || "",
    });
  }, [user]);

  useEffect(() => {
    refreshProfile().catch(() => undefined);
  }, [refreshProfile]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        avatarUrl: form.avatarUrl.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        profession: form.profession.trim() || undefined,
        designation: form.designation.trim() || undefined,
        organization: form.organization.trim() || undefined,
        reference: form.reference.trim() || undefined,
      });
      showToast("Profile updated");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not update profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-ink">My profile</h1>
      <p className="mt-2 text-sm text-mist">
        Manage your account details. Email is managed by your login identity.
      </p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-ink/5 bg-white p-5 text-sm sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-mist">Email</div>
          <div className="mt-1 font-medium text-ink">{user?.email}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-mist">Token role</div>
          <div className="mt-1 font-medium text-ink">
            {tokenProfile?.role?.replaceAll("_", " ") || user?.role?.replaceAll("_", " ")}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-mist">User ID</div>
          <div className="mt-1 truncate font-medium text-ink">{user?.id || tokenProfile?.userId}</div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-3xl border border-ink/5 bg-white p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              Full name
            </span>
            <input
              className={fieldClass}
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              Phone
            </span>
            <input
              className={fieldClass}
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              Avatar URL
            </span>
            <input
              className={fieldClass}
              value={form.avatarUrl}
              onChange={(e) => set("avatarUrl", e.target.value)}
              placeholder="https://"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              Address
            </span>
            <input
              className={fieldClass}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              City
            </span>
            <input
              className={fieldClass}
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              State
            </span>
            <input
              className={fieldClass}
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              Profession
            </span>
            <input
              className={fieldClass}
              value={form.profession}
              onChange={(e) => set("profession", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              Designation
            </span>
            <input
              className={fieldClass}
              value={form.designation}
              onChange={(e) => set("designation", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              Organization
            </span>
            <input
              className={fieldClass}
              value={form.organization}
              onChange={(e) => set("organization", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist">
              Reference
            </span>
            <input
              className={fieldClass}
              value={form.reference}
              onChange={(e) => set("reference", e.target.value)}
            />
          </label>
        </div>

        {error && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-gold hover:text-navy disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
        <p className="text-xs text-mist">
          Uses <code className="text-ink">PATCH /api/v1/auth/profile</code> by default. Override with{" "}
          <code className="text-ink">NEXT_PUBLIC_AUTH_PROFILE_PATH</code> if your API path differs.
        </p>
      </form>
    </div>
  );
}
