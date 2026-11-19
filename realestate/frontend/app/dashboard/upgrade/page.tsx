"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Wrench, Check, Loader2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { addRoles } from "@/lib/api/users";
import { RealRole } from "@/lib/auth/types";

const upgradeOptions: {
  role: Extract<RealRole, "OWNER" | "PROVIDER">;
  title: string;
  icon: typeof Building2;
  desc: string;
  bullets: string[];
  dashboardPath: string;
}[] = [
  {
    role: "OWNER",
    title: "Sell or rent out a property",
    icon: Building2,
    desc: "List as an individual owner, agent, or builder — get a listing dashboard, lead CRM, and analytics.",
    bullets: ["Post unlimited listings (with credits)", "Track leads through a full CRM pipeline", "KYC & RERA verification for the trust seal"],
    dashboardPath: "/dashboard/owner",
  },
  {
    role: "PROVIDER",
    title: "Offer a service",
    icon: Wrench,
    desc: "Legal, finance, or home-services businesses — get a bookings dashboard and marketplace listing.",
    bullets: ["Get discovered in the services marketplace", "Manage bookings from a single dashboard", "Track earnings from completed jobs"],
    dashboardPath: "/dashboard/provider",
  },
];

export default function UpgradeRolePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [busyRole, setBusyRole] = useState<RealRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(role: Extract<RealRole, "OWNER" | "PROVIDER">, dashboardPath: string) {
    setError(null);
    setBusyRole(role);
    try {
      await addRoles([role]);
      await refreshUser();
      router.push(dashboardPath);
    } catch {
      setError("Could not add this role right now. Please try again.");
    } finally {
      setBusyRole(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-medium text-ink-900">Add another role to your account</h1>
        <p className="mt-2 text-sm text-text-600">
          Your account already has full access as a Property Seeker. Add one of these to also get a
          dedicated dashboard for listing or offering services — no need to create a new account.
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm text-danger-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {upgradeOptions.map((opt) => {
            const already = user?.roles.includes(opt.role);
            return (
              <div key={opt.role} className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-brass-300">
                  <opt.icon size={20} />
                </div>
                <h2 className="mt-4 font-display text-lg font-medium text-ink-900">{opt.title}</h2>
                <p className="mt-1.5 text-sm text-text-600">{opt.desc}</p>
                <ul className="mt-4 space-y-2">
                  {opt.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-text-600">
                      <Check size={14} className="mt-0.5 shrink-0 text-brand-600" /> {b}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={already ? "outline" : "primary"}
                  size="md"
                  className="mt-5 w-full"
                  disabled={!!already || busyRole === opt.role}
                  icon={busyRole === opt.role ? <Loader2 size={15} className="animate-spin" /> : undefined}
                  onClick={() => handleUpgrade(opt.role, opt.dashboardPath)}
                >
                  {already ? "Already enabled — go to dashboard" : busyRole === opt.role ? "Setting up…" : "Add this role"}
                </Button>
                {already && (
                  <button
                    onClick={() => router.push(opt.dashboardPath)}
                    className="mt-2 w-full text-center text-xs font-medium text-brand-600 hover:underline"
                  >
                    Go to {opt.title.includes("service") ? "provider" : "owner"} dashboard →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
