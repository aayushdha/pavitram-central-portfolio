"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { useAuth, primaryDashboardPath } from "@/lib/auth/AuthProvider";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next");
  const { status, user, login, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Bounce straight to the right dashboard.
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(next && next.startsWith("/dashboard") ? next : primaryDashboardPath(user));
    }
  }, [status, user, router, next]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      const me = await login(email, password);
      router.replace(next && next.startsWith("/dashboard") ? next : primaryDashboardPath(me));
    } catch {
      // error already set on context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <SealMark size={30} className="text-brand-600" />
      <h1 className="mt-4 font-display text-2xl font-medium text-ink-900">Welcome back</h1>
      <p className="mt-2 text-sm text-text-600">
        Sign in with your single Pavitram identity — the platform loads the dashboard that matches your account&apos;s
        role automatically.
      </p>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-7">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-danger-50 p-3 text-xs text-danger-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-600">Email address</span>
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-3 focus-within:border-brand-400">
              <Mail size={15} className="text-text-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-400"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-600">Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-3 focus-within:border-brand-400">
              <Lock size={15} className="text-text-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-400"
              />
            </div>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={submitting}
            icon={submitting ? <Loader2 size={15} className="animate-spin" /> : undefined}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-text-500">
          New to Pavitram?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-text-400">
          By continuing you agree to Pavitram&apos;s{" "}
          <Link href="#" className="underline hover:text-ink-900">Terms</Link> and{" "}
          <Link href="#" className="underline hover:text-ink-900">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
      <Footer />
    </>
  );
}
