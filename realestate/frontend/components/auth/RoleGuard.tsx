"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth, primaryDashboardPath } from "@/lib/auth/AuthProvider";
import { RealRole } from "@/lib/auth/types";
import { Button } from "@/components/ui/Button";

/**
 * Wraps a whole `/dashboard/<role>` section. Handles the three states the
 * `middleware.ts` cookie check can't:
 *   1. token present but invalid/expired            → bounce to /login
 *   2. token valid but account lacks the needed role → "not your dashboard"
 *   3. still checking                                → skeleton, no flash of content
 */
export function RoleGuard({
  role,
  children,
}: {
  /** Functional role required for this section. Omit to just require "logged in". */
  role?: RealRole;
  children: ReactNode;
}) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hasAccess = !role || (user?.roles.includes(role) ?? false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex items-center gap-2.5 text-sm text-text-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-brand-600" />
          Checking your session…
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // redirecting via the effect above
  }

  if (!hasAccess) {
    const canSelfUpgrade = role === "OWNER" || role === "PROVIDER";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-50 px-6 text-center">
        <ShieldAlert size={28} className="text-warning-600" />
        <p className="font-display text-lg font-medium text-ink-900">This dashboard isn&apos;t part of your account</p>
        <p className="max-w-sm text-sm text-text-500">
          Your account doesn&apos;t currently have the <span className="font-medium">{role}</span> role.
          {canSelfUpgrade ? " You can add it in a couple of taps." : ""}
        </p>
        <div className="flex gap-3">
          <Button href={primaryDashboardPath(user)} variant="outline" size="md">
            Go to my dashboard
          </Button>
          {canSelfUpgrade && (
            <Button href="/dashboard/upgrade" variant="primary" size="md">
              Add this role
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
