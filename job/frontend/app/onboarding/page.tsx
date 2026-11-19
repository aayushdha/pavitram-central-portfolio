"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, dashboardPathForRole } from "@/lib/auth-context";
import { Search, Briefcase, Loader2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const { user, loading, setPortalRole } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState<"SEEKER" | "EMPLOYER" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set right before setPortalRole resolves — the effect below then waits
  // for `user` to actually carry that role before navigating, so the next
  // page never mounts against a stale (pre-update) role.
  const chosenRoleRef = useRef<"SEEKER" | "EMPLOYER" | null>(null);

  // Must be logged in to reach this page.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (chosenRoleRef.current && user.role === chosenRoleRef.current) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [loading, user, router]);

  async function choose(role: "SEEKER" | "EMPLOYER") {
    setError(null);
    setSubmitting(role);
    try {
      chosenRoleRef.current = role;
      await setPortalRole(role);
      // Navigation happens in the effect above once `user.role` reflects
      // this change — not here, to avoid racing the context update.
    } catch {
      chosenRoleRef.current = null;
      setError("Something went wrong. Please try again.");
      setSubmitting(null);
    }
  }

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-white mb-10 justify-center">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-spark-500 grid place-items-center text-sm">JC</span>
          JobConnect
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2">What brings you to JobConnect?</h1>
          <p className="text-white/60">Pick one to set up your account. You can change this later in Settings.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-bad-100 text-bad-500 text-sm px-4 py-2.5 mb-6 text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <button
            onClick={() => choose("SEEKER")}
            disabled={submitting !== null}
            className="text-left rounded-2xl border-2 border-white/10 bg-white/5 hover:border-brand-400 hover:bg-white/[0.08] disabled:opacity-60 transition-all p-8 group"
          >
            <div className="h-12 w-12 rounded-xl bg-brand-500/15 text-brand-400 grid place-items-center mb-5">
              <Search size={22} />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">I&apos;m looking for a job</h2>
            <p className="text-sm text-white/60 mb-5">
              Search roles, build your profile, and connect with recruiters and employers.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400">
              {submitting === "SEEKER" ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Setting up...
                </>
              ) : (
                <>
                  Continue as a job seeker
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </span>
          </button>

          <button
            onClick={() => choose("EMPLOYER")}
            disabled={submitting !== null}
            className="text-left rounded-2xl border-2 border-white/10 bg-white/5 hover:border-spark-400 hover:bg-white/[0.08] disabled:opacity-60 transition-all p-8 group"
          >
            <div className="h-12 w-12 rounded-xl bg-spark-500/15 text-spark-400 grid place-items-center mb-5">
              <Briefcase size={22} />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">I&apos;m hiring talent</h2>
            <p className="text-sm text-white/60 mb-5">
              Post jobs, search resumes, and manage your hiring pipeline in one place.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-spark-400">
              {submitting === "EMPLOYER" ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Setting up...
                </>
              ) : (
                <>
                  Continue as an employer
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
