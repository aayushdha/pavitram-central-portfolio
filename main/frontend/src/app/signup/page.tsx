"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell, Field, SubmitButton, inputClass } from "@/components/auth/auth-form";
import { ApiError } from "@/lib/auth/api";
import { showToast } from "@/components/site";

export default function SignupPage() {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      showToast("Account created — welcome to Pavitram");
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Join Pavitram"
      subtitle="Create your account to access Mart, Wellness, Properties, Gyan and more."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email *">
          <input
            className={inputClass}
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="rahul@example.com"
          />
        </Field>
        <Field label="Phone *">
          <input
            className={inputClass}
            required
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="9876543210"
          />
        </Field>
        <Field label="Password *">
          <input
            className={inputClass}
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="At least 6 characters"
          />
        </Field>
        {error && (
          <p className="rounded-xl border border-red-400/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
