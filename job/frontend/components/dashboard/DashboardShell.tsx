"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Bell, Search, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
};

function initialsFor(name: string | null, email: string) {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const roleLabels: Record<string, string> = {
  SEEKER: "Job Seeker",
  EMPLOYER: "Employer",
  ADMIN: "Super Admin",
};

export function DashboardShell({
  children,
  navItems,
  accentLabel,
  searchHref,
  notificationsHref,
}: {
  children: ReactNode;
  navItems: NavItem[];
  accentLabel: string;
  searchHref?: string;
  notificationsHref?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");

  const initials = user ? initialsFor(user.name, user.email) : "--";
  const displayName = user?.name || user?.email || "Loading...";
  const roleLabel = user ? roleLabels[user.role] || user.role : "";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-40 w-72 shrink-0 border-r border-border bg-ink-900 text-white flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-spark-500 grid place-items-center text-white text-sm">
              JC
            </span>
            JobConnect
          </Link>
          <button className="lg:hidden text-white/70" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-4">
          <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold px-2">
            {accentLabel}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1 scrollbar-thin">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={active ? "text-spark-400" : ""}>{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-[10px] font-semibold bg-spark-500 text-white rounded-full px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-brand-500 text-ink-900 grid place-items-center text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-[11px] text-white/50 truncate">{roleLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="h-8 w-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-8">
          <button className="lg:hidden text-ink" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md bg-background rounded-xl px-3 py-2 border border-border">
            <Search size={16} className="text-muted" />
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchHref) {
                  router.push(`${searchHref}?q=${encodeURIComponent(searchDraft)}`);
                }
              }}
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted"
            />
          </div>
          <div className="flex-1 sm:hidden" />
          {notificationsHref ? (
            <Link href={notificationsHref} className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-background text-ink">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-spark-500" />
            </Link>
          ) : (
            <NotificationBell />
          )}
          <div className="h-9 w-9 rounded-full bg-brand-500 text-ink-900 grid place-items-center text-xs font-semibold">
            {initials}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

const adminNotifications = [
  { id: "n1", text: "New employer KYC request is waiting for review", time: "5m ago" },
  { id: "n2", text: "3 job postings were flagged by fraud rules", time: "1h ago" },
  { id: "n3", text: "A support ticket is close to its SLA deadline", time: "2h ago" },
];

const employerNotifications = [
  { id: "n1", text: "12 new applications came in on your open roles", time: "10m ago" },
  { id: "n2", text: "A candidate accepted your interview invite", time: "1h ago" },
  { id: "n3", text: "One of your job posts expires in 3 days", time: "3h ago" },
];

/** Dropdown bell used on dashboards that have no dedicated notifications page. */
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [cleared, setCleared] = useState(false);
  const items = cleared ? [] : user?.role === "ADMIN" ? adminNotifications : employerNotifications;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-background text-ink"
      >
        <Bell size={18} />
        {items.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-spark-500" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface shadow-lg z-30">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {items.length > 0 && (
              <button onClick={() => setCleared(true)} className="text-xs font-semibold text-brand-600">
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">You&apos;re all caught up.</p>
          ) : (
            <ul className="divide-y divide-border max-h-80 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="px-4 py-3">
                  <p className="text-sm text-ink">{n.text}</p>
                  <p className="text-[11px] text-muted mt-0.5">{n.time}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
