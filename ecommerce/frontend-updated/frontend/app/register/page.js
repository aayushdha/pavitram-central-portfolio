"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Field, Input, Button } from "@/components/Field";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const { register } = useStore();
  const router = useRouter();
  const [next] = useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") || "/account" : "/account"
  );
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: "customer" });
    setLoading(false);
    if (res.ok) router.push(next);
    else setError(res.error);
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-5 py-16">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          For personal, retail shopping on Pavitram.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Full name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rhea Kapoor" />
          </Field>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </Field>
          <Field label="Mobile number">
            <Input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Password">
            <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </Field>
          {error && <p className="text-xs" style={{ color: "var(--color-rose)" }}>{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating account…" : "Create account"}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Registering a company or store instead?{" "}
          <Link href="/business/signup" className="font-semibold hover:underline" style={{ color: "var(--color-jade)" }}>
            Sell or buy in bulk on Pavitram
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
