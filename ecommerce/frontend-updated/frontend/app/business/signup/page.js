"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Store, ArrowRight, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/Field";
import { useStore } from "@/lib/store";

// This page used to collect a brand-new email/password and call
// authApi.signup() — creating a SECOND identity for the same person.
// That's wrong: Pavitram has exactly ONE identity per person (handled by
// the external auth service via the normal /login or /register page).
// This page's only job now is:
//   1. Make sure the visitor is already logged in (one account, no new
//      password collected here).
//   2. Ask whether they want to buy in bulk or sell.
//   3. Send them to the KYC-only step (/vendor/register or /b2b/register),
//      which attaches role + vendorId/buyerId to their EXISTING account.
export default function BusinessGatewayPage() {
  const { auth } = useStore();
  const router = useRouter();
  const [type, setType] = useState("buyer");

  useEffect(() => {
    if (auth?.vendorId) router.push("/vendor/dashboard");
    else if (auth?.buyerId) router.push("/b2b/dashboard");
  }, [auth?.vendorId, auth?.buyerId, router]);

  if (auth?.vendorId || auth?.buyerId) {
    return null;
  }

  const continueToKyc = () => router.push(type === "buyer" ? "/b2b/register" : "/vendor/register");

  if (!auth) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ background: "var(--color-jade)" }}
          >
            One Pavitram account for everything
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
            Log in first — then register as a business
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Selling or buying in bulk doesn&apos;t need a separate password.
            Log in (or create your one Pavitram account if you&apos;re new),
            and we&apos;ll bring you straight back here to finish your
            business or vendor details.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/login?next=${encodeURIComponent("/business/signup")}`}
              className="flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--color-jade)" }}
            >
              <LogIn size={16} /> Log in to my account
            </Link>
            <Link
              href={`/register?next=${encodeURIComponent("/business/signup")}`}
              className="text-sm font-semibold text-ink hover:underline"
            >
              New here? Create your account
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-md px-5 py-16">
        <span
          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ background: "var(--color-jade)" }}
        >
          Logged in as {auth.name}
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
          What do you want to do on Pavitram?
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          No new login needed — this just attaches a business profile to
          your existing account.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType("buyer")}
            className="flex flex-col items-start gap-1 rounded-2xl border p-4 text-left"
            style={{
              borderColor: type === "buyer" ? "var(--color-jade)" : "var(--color-line)",
              background: type === "buyer" ? "var(--color-jade-dim)" : "var(--color-paper-raised)",
            }}
          >
            <Building2 size={18} style={{ color: "var(--color-jade)" }} />
            <span className="text-sm font-semibold text-ink">Buy in bulk</span>
            <span className="text-xs text-ink-muted">Business buyer / B2B</span>
          </button>
          <button
            type="button"
            onClick={() => setType("vendor")}
            className="flex flex-col items-start gap-1 rounded-2xl border p-4 text-left"
            style={{
              borderColor: type === "vendor" ? "var(--color-jade)" : "var(--color-line)",
              background: type === "vendor" ? "var(--color-jade-dim)" : "var(--color-paper-raised)",
            }}
          >
            <Store size={18} style={{ color: "var(--color-jade)" }} />
            <span className="text-sm font-semibold text-ink">Sell my products</span>
            <span className="text-xs text-ink-muted">Vendor / seller</span>
          </button>
        </div>

        <Button onClick={continueToKyc} className="mt-6 w-full" style={{ background: "var(--color-jade)" }}>
          Continue to {type === "buyer" ? "business" : "seller"} verification <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>
      <Footer />
    </div>
  );
}
