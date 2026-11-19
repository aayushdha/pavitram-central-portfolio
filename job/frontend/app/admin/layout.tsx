"use client";

import { ReactNode } from "react";
import { DashboardShell, NavItem } from "@/components/dashboard/DashboardShell";
import { useRequireRole } from "@/lib/use-require-role";
import { Loader2 } from "lucide-react";
import {
  LayoutGrid,
  Users,
  ShieldAlert,
  IndianRupee,
  LifeBuoy,
  Settings,
} from "lucide-react";

const navItems: NavItem[] = [
  { label: "Platform overview", href: "/admin/dashboard", icon: <LayoutGrid size={18} /> },
  { label: "Users & KYC", href: "/admin/users", icon: <Users size={18} /> },
  { label: "Moderation", href: "/admin/moderation", icon: <ShieldAlert size={18} />, badge: "5" },
  { label: "Revenue", href: "/admin/revenue", icon: <IndianRupee size={18} /> },
  { label: "Support", href: "/admin/dashboard#support", icon: <LifeBuoy size={18} /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole(["ADMIN"]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    );
  }

  return (
    <DashboardShell navItems={navItems} accentLabel="Governance & Control" searchHref="/admin/users">
      {children}
    </DashboardShell>
  );
}
