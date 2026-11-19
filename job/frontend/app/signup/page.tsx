"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, dashboardPathForRole } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { AlertCircle, Loader2 } from "lucide-react";

export default function SignupPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // A fresh signup always continues to /onboarding, not the default-role
  // dashboard — this flag stops the "already logged in" effect below from
  // racing that redirect the instant the new user is set in state.
  const justRegisteredRef = useRef(false);

  useEffect(() => {
    if (!loading && user && !justRegisteredRef.current) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      justRegisteredRef.current = true;
      await register({ name: name.trim() || undefined, email, password, phone });
      // Role isn't chosen here — the dedicated onboarding step handles that,
      // matching how the central auth API separates signup from profile setup.
      router.push("/onboarding");
    } catch (err) {
      justRegisteredRef.current = false;
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink mb-8 justify-center">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-spark-500 grid place-items-center text-white text-sm">JC</span>
          JobConnect
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-7">
          <h1 className="font-display text-2xl font-bold text-ink mb-1 text-center">Create your account</h1>
          <p className="text-sm text-muted mb-6 text-center">
            One account for everyone. You&apos;ll pick job seeker or employer next.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-bad-100 text-bad-500 text-sm px-3.5 py-2.5 mb-4">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
                pattern="[0-9]{10}"
                title="10-digit phone number"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-ink-900 font-semibold py-2.5 text-sm text-center mt-1 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Creating account..." : "Continue"}
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            Already have an account? <Link href="/login" className="text-brand-600 font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
