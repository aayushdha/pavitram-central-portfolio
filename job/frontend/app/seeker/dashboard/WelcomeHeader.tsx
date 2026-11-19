"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/lib/auth-context";

/** Greets the signed-in person by their own name. */
export function WelcomeHeader() {
  const { user } = useAuth();
  const first = user?.name?.trim().split(/\s+/)[0];
  return (
    <PageHeader
      title={first ? `Welcome back, ${first}` : "Welcome back"}
      subtitle="Here's how your job search is tracking this week."
      actions={
        <Link
          href="/seeker/jobs"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 text-ink-900 px-4 py-2.5 text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          <Sparkles size={16} /> Find matching jobs
        </Link>
      }
    />
  );
}
