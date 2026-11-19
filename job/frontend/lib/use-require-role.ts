"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathForRole } from "./auth-context";
import { PortalRole } from "./api-client";

/**
 * Guards a dashboard section. If nobody's logged in, bounce to /login.
 * If someone IS logged in but their role doesn't belong here (e.g. a SEEKER
 * hitting /admin/*), send them to the dashboard that actually matches their
 * account instead of showing them a section that isn't theirs.
 */
export function useRequireRole(allowed: PortalRole[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allowed.includes(user.role)) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [user, loading, allowed, router]);

  return { user, loading, ready: !loading && !!user && allowed.includes(user.role) };
}
