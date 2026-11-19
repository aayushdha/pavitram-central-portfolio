"use client";

import { ReactNode } from "react";
import { DashboardShell, NavItem } from "@/components/dashboard/DashboardShell";
import { useRequireRole } from "@/lib/use-require-role";
import { Loader2 } from "lucide-react";
import {
  LayoutGrid,
  Briefcase,
  Users,
  BarChart3,
  Building2,
  CreditCard,
  MessageSquare,
  Star,
} from "lucide-react";

const navItems: NavItem[] = [
  { label: "Overview", href: "/employer/dashboard", icon: <LayoutGrid size={18} /> },
  { label: "Job postings", href: "/employer/jobs", icon: <Briefcase size={18} /> },
  { label: "Candidates & ATS", href: "/employer/candidates", icon: <Users size={18} /> },
  { label: "Talent pool", href: "/employer/talent-pool", icon: <Star size={18} /> },
  { label: "Messages", href: "/employer/messages", icon: <MessageSquare size={18} />, badge: "1" },
  { label: "Hiring analytics", href: "/employer/analytics", icon: <BarChart3 size={18} /> },
  { label: "Company profile", href: "/employer/company", icon: <Building2 size={18} /> },
  { label: "Billing & credits", href: "/employer/billing", icon: <CreditCard size={18} /> },
];

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole(["EMPLOYER"]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    );
  }

  return (
    <DashboardShell navItems={navItems} accentLabel="Hiring Command Center" searchHref="/employer/candidates">
      {children}
    </DashboardShell>
  );
}
