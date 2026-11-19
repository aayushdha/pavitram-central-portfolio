"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, dashboardPathForRole } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in (e.g. navigated back to /login manually) — send
  // straight to the right dashboard instead of showing the form again.
  useEffect(() => {
    if (!loading && user) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(identifier, password);
      // Don't navigate here with a locally-returned role — let the effect
      // above do it once React has actually committed the new `user` into
      // context, so the next page never mounts against a stale role.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 text-white p-12">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-spark-500 grid place-items-center text-sm">JC</span>
          JobConnect
        </Link>
        <div>
          <p className="font-display text-3xl font-bold leading-tight max-w-md">
            One identity. Job search, networking, and hiring — unified.
          </p>
          <p className="text-white/50 mt-4 max-w-sm text-sm">
            One login for everyone — job seekers, employers, and admins. What you see after
            logging in depends on your account, not on a tab you pick here.
          </p>
        </div>
        <p className="text-xs text-white/30">© 2026 Pavitram JobConnect</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex items-center gap-2 font-display font-bold text-lg text-ink mb-8">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-spark-500 grid place-items-center text-white text-sm">JC</span>
            JobConnect
          </Link>

          <h1 className="font-display text-2xl font-bold text-ink mb-1">Log in</h1>
          <p className="text-sm text-muted mb-6">Use your email or phone number.</p>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-bad-100 text-bad-500 text-sm px-3.5 py-2.5 mb-4">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Email or phone</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-ink-900 font-semibold py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-8">
            New to JobConnect? <Link href="/signup" className="text-brand-600 font-semibold">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
