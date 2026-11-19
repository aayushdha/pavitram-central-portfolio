"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Field, Input, Button } from "@/components/Field";
import { useStore } from "@/lib/store";

// ONE login for every kind of Pavitram account. There is no separate
// "customer login" / "vendor login" / "business login" — a single
// email+password is checked against the single account, and that
// account's own role (set when they registered, or when they later
// completed vendor/business KYC) decides where they land:
//   admin   -> /admin/dashboard
//   vendor  -> their store dashboard (or the KYC form if not submitted yet)
//   b2b     -> their business dashboard (or the KYC form if not submitted yet)
//   customer-> their normal account page
// A plain customer can still browse the whole site, and can turn their
// same account into a vendor/business at any time via /business/signup —
// no new login is ever created for that.
function defaultDestinationFor(user) {
  if (user.role === "admin") return "/admin/dashboard";
  if (user.role === "vendor") return user.vendorId ? "/vendor/dashboard" : "/vendor/register";
  if (user.role === "b2b") return user.buyerId ? "/b2b/dashboard" : "/b2b/register";
  return "/account";
}

export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();
  const [explicitNext] = useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null
  );
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.ok) router.push(explicitNext || defaultDestinationFor(res.user));
    else setError(res.error);
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-5 py-16">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Log in to Pavitram
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          One account, one login — for shoppers, vendors, and business buyers alike.
          You&apos;ll land straight on your dashboard based on your account. Running a
          business or selling on Pavitram?{" "}
          <Link href="/business/signup" className="font-semibold hover:underline" style={{ color: "var(--color-jade)" }}>
            Set up your business or store
          </Link>{" "}
          after logging in.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
          </Field>
          <Field label="Password">
            <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </Field>
          {error && <p className="text-xs" style={{ color: "var(--color-rose)" }}>{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New to Pavitram?{" "}
          <Link href="/register" className="font-semibold text-ink hover:underline">
            Create a personal account
          </Link>
          .
        </p>
      </div>
      <Footer />
    </div>
  );
}
