"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, Loader2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { useAuth, primaryDashboardPath } from "@/lib/auth/AuthProvider";

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next");
  const { status, user, signup, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(next && next.startsWith("/dashboard") ? next : primaryDashboardPath(user));
    }
  }, [status, user, router, next]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // Every new account starts as a Property Seeker — Owner/Agent/Builder
      // and Service Provider are added afterwards from /dashboard/upgrade,
      // once someone is actually signed in.
      const me = await signup({ name, email, phone: phone || undefined, password });
      router.replace(next && next.startsWith("/dashboard") ? next : primaryDashboardPath(me));
    } catch {
      /* error already set on context */
    } finally {
      setSubmitting(false);
    }
  }

  const shownError = formError ?? error;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <SealMark size={30} className="text-brand-600" />
      <h1 className="mt-4 font-display text-2xl font-medium text-ink-900">Create your Pavitram account</h1>
      <p className="mt-2 text-sm text-text-600">
        One identity for the whole platform. Once you&apos;re signed in, you can also become an Owner/Agent/Builder
        or a Service Provider from your dashboard — no separate signup needed.
      </p>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-7">
        {shownError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-danger-50 p-3 text-xs text-danger-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {shownError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-600">Full name</span>
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-3 focus-within:border-brand-400">
              <User size={15} className="text-text-400" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ananya Sharma"
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-400"
              />
            </div>
          </label>
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
            <span className="mb-1.5 block text-xs font-medium text-text-600">Mobile number</span>
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-3 focus-within:border-brand-400">
              <Phone size={15} className="text-text-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-400"
              />
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
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
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-600">Confirm password</span>
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-3 focus-within:border-brand-400">
                <Lock size={15} className="text-text-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-400"
                />
              </div>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={submitting}
            icon={submitting ? <Loader2 size={15} className="animate-spin" /> : undefined}
          >
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-text-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-text-400">
          By creating an account you agree to Pavitram&apos;s{" "}
          <Link href="#" className="underline hover:text-ink-900">Terms</Link> and{" "}
          <Link href="#" className="underline hover:text-ink-900">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <RegisterContent />
      </Suspense>
      <Footer />
    </>
  );
}
