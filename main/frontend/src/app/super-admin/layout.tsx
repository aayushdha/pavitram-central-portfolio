"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Compass,
  HelpCircle,
  Quote,
  Users,
  BarChart3,
  FileText,
  Settings,
  UserPlus,
  MessageSquare,
  ShieldCheck,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

const NAV = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/services", label: "Services", icon: Layers },
  { href: "/super-admin/opportunities", label: "Opportunities", icon: Compass },
  { href: "/super-admin/pages", label: "Pages & Sections", icon: FileText },
  { href: "/super-admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/super-admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/super-admin/team", label: "Team", icon: Users },
  { href: "/super-admin/stats", label: "Impact Stats", icon: BarChart3 },
  { href: "/super-admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/super-admin/settings", label: "Site Settings", icon: Settings },
  { href: "/super-admin/community", label: "Join Requests", icon: UserPlus },
  { href: "/super-admin/messages", label: "Contact Messages", icon: MessageSquare },
  { href: "/super-admin/users", label: "Users & Roles", icon: ShieldCheck },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/super-admin";
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isLoginPage = pathname === "/super-admin/login";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (loading) return;
    if (!isLoginPage && !isAdmin) {
      router.replace("/super-admin/login");
    }
  }, [loading, isAdmin, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-haze">
        <p className="text-sm text-mist">Checking access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-haze">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-ink/8 bg-navy px-4 py-3.5 lg:hidden">
        <span className="font-display text-lg font-bold text-white">Pavitram Admin</span>
        <button onClick={() => setMobileNavOpen((v) => !v)} className="text-white">
          {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="lg:flex">
        {/* Sidebar */}
        <aside
          className={`${
            mobileNavOpen ? "block" : "hidden"
          } w-full shrink-0 border-r border-ink/8 bg-navy lg:block lg:w-64 lg:min-h-screen`}
        >
          <div className="hidden px-6 py-6 lg:block">
            <span className="font-display text-xl font-bold text-white">Pavitram Admin</span>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-gold">
              Super Admin Panel
            </p>
          </div>

          <nav className="space-y-0.5 px-3 py-4">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                    active ? "bg-gold text-navy font-bold" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-white/10 px-3 py-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" /> View live site
            </Link>
            <button
              onClick={() => {
                logout();
                router.replace("/super-admin/login");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-sm text-mist">
                Signed in as <span className="font-semibold text-ink">{user?.name || user?.email}</span>{" "}
                <span className="ml-1 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold-dark">
                  {user?.role?.replaceAll("_", " ")}
                </span>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
