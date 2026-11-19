"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Field, Input, Button } from "@/components/Field";
import { accountNav } from "@/lib/accountNav";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { auth, updateProfile, notify } = useStore();
  const [form, setForm] = useState({ name: auth?.name || "", email: auth?.email || "", phone: auth?.phone || "" });
  const [pw, setPw] = useState({ current: "", next: "" });

  const saveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name: form.name, email: form.email, phone: form.phone });
  };

  const changePassword = (e) => {
    e.preventDefault();
    notify("Password updated");
    setPw({ current: "", next: "" });
  };

  return (
    <DashboardShell
      title="Profile Details"
      roleLabel="My Account"
      accent="var(--color-gold)"
      nav={accountNav}
      activeHref="/account/profile"
      requireRole="customer"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <h2 className="font-display text-base font-semibold text-ink">Personal details</h2>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Mobile number"><Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></Field>
            <Button type="submit" variant="gold">Save changes</Button>
          </form>
        </div>

        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <h2 className="font-display text-base font-semibold text-ink">Change password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <Field label="Current password"><Input type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
            <Field label="New password"><Input type="password" required minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
            <Button type="submit" variant="outline">Update password</Button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
