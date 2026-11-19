"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, UserRound, Menu, X, Home } from "lucide-react";
import { useState, type ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/components/auth/auth-provider";
import { LOGO_URL } from "@/components/site";

const NAV = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "My Profile", Icon: UserRound },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function onLogout() {
    logout();
    router.replace("/login");
  }

  const side = (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-navy text-white">
      <Link href="/" className="flex items-center gap-3 px-5 py-6">
        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl ring-1 ring-gold/40">
          <img src={LOGO_URL} alt="" className="h-10 w-10 object-contain" />
        </span>
        <div>
          <div className="font-display text-lg font-bold leading-tight">
            Pavitram <span className="text-gold">India</span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Member hub</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-gold/15 text-gold" : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
        >
          <Home className="h-4 w-4" />
          Main website
        </Link>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 truncate text-sm">
          <div className="font-semibold text-white">{user?.name}</div>
          <div className="truncate text-xs text-white/50">{user?.email}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:border-gold hover:text-gold"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <RequireAuth>
      <div className="min-h-screen bg-haze">
        <div className="hidden md:fixed md:inset-y-0 md:flex">{side}</div>

        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              className="absolute inset-0 bg-navy/60"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 h-full w-72 shadow-2xl">{side}</div>
          </div>
        )}

        <div className="md:pl-64">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/5 bg-haze/90 px-4 py-3 backdrop-blur md:px-8">
            <button
              className="rounded-lg p-2 text-ink md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              {open ? <X /> : <Menu />}
            </button>
            <div className="font-display text-lg font-bold text-ink md:text-xl">Member Dashboard</div>
            {user?.role ? (
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-mist">
                {user.role.replaceAll("_", " ")}
              </div>
            ) : (
              <div />
            )}
          </header>
          <main className="px-4 py-8 md:px-8">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
