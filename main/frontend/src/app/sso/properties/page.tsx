"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { getPropertiesServiceUrl } from "@/lib/auth/api";

/**
 * Hands off the logged-in Bearer token to the realestate app.
 * Realestate stores it as localStorage `pavitram_token` and sends:
 *   Authorization: Bearer <token>
 */
export default function PropertiesSsoPage() {
  const { token, isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !token) {
      router.replace("/login?next=/sso/properties");
      return;
    }

    try {
      // Keep exact keys realestate expects
      localStorage.setItem("pavitram_token", token);
      if (user) {
        localStorage.setItem("pavitram_re_profile", JSON.stringify(user));
      }

      const target = getPropertiesServiceUrl(token);
      window.location.replace(target);
    } catch {
      setError("Could not open Properties. Please try again.");
    }
  }, [loading, isAuthenticated, token, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6 text-center text-white">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Secure handoff</p>
        <h1 className="mt-3 font-display text-2xl font-bold">Opening Pavitram Properties…</h1>
        <p className="mt-2 text-sm text-white/65">
          Passing your session as Bearer token so you stay logged in.
        </p>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </div>
    </div>
  );
}
