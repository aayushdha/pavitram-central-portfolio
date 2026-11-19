"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathForRole } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

export function MarketingNav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-spark-500 grid place-items-center text-white text-sm">
            JC
          </span>
          JobConnect
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <a href="#seekers" className="hover:text-ink">For job seekers</a>
          <a href="#employers" className="hover:text-ink">For employers</a>
          <a href="#platform" className="hover:text-ink">Platform</a>
        </nav>

        {loading ? (
          <div className="h-9 w-24" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <Link
              href={dashboardPathForRole(user.role)}
              className="text-sm font-semibold text-ink hidden sm:block"
            >
              {user.name || user.email}
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-ink-900 hover:bg-ink-800 text-white rounded-xl px-4 py-2.5 transition-colors"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-ink hidden sm:block">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-ink-900 rounded-xl px-4 py-2.5 transition-colors"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
