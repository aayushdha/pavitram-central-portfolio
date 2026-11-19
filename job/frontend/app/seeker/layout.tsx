"use client";

import { ReactNode } from "react";
import { DashboardShell, NavItem } from "@/components/dashboard/DashboardShell";
import { useRequireRole } from "@/lib/use-require-role";
import { Loader2 } from "lucide-react";
import {
  LayoutGrid,
  Search,
  ClipboardList,
  UserRound,
  Users2,
  BookmarkCheck,
  FileEdit,
  Settings,
  Bell,
  MessageSquare,
  Building2,
  Award,
  IndianRupee,
  BellRing,
  UserSearch,
  GraduationCap,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

const navItems: NavItem[] = [
  { label: "Overview", href: "/seeker/dashboard", icon: <LayoutGrid size={18} /> },
  { label: "Find jobs", href: "/seeker/jobs", icon: <Search size={18} /> },
  { label: "Applications", href: "/seeker/applications", icon: <ClipboardList size={18} />, badge: "6" },
  { label: "Saved jobs", href: "/seeker/jobs?tab=saved", icon: <BookmarkCheck size={18} /> },
  { label: "Job alerts", href: "/seeker/job-alerts", icon: <BellRing size={18} /> },
  { label: "Resume builder", href: "/seeker/resume-builder", icon: <FileEdit size={18} /> },
  { label: "Assessments", href: "/seeker/assessments", icon: <Award size={18} /> },
  { label: "Interview prep", href: "/seeker/interview-prep", icon: <MessageSquareText size={18} /> },
  { label: "Learning", href: "/seeker/learning", icon: <GraduationCap size={18} /> },
  { label: "Messages", href: "/seeker/messages", icon: <MessageSquare size={18} />, badge: "2" },
  { label: "Notifications", href: "/seeker/notifications", icon: <Bell size={18} /> },
  { label: "Network", href: "/seeker/network", icon: <Users2 size={18} /> },
  { label: "People", href: "/seeker/people", icon: <UserSearch size={18} /> },
  { label: "Groups", href: "/seeker/groups", icon: <Users2 size={18} /> },
  { label: "Companies", href: "/seeker/companies", icon: <Building2 size={18} /> },
  { label: "Salary insights", href: "/seeker/salary-insights", icon: <IndianRupee size={18} /> },
  { label: "Premium", href: "/seeker/premium", icon: <Sparkles size={18} /> },
  { label: "Profile", href: "/seeker/profile", icon: <UserRound size={18} /> },
  { label: "Settings", href: "/seeker/settings", icon: <Settings size={18} /> },
];

export default function SeekerLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole(["SEEKER"]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    );
  }

  return (
    <DashboardShell
      navItems={navItems}
      accentLabel="Job Seeker Workspace"
      searchHref="/seeker/search"
      notificationsHref="/seeker/notifications"
    >
      {children}
    </DashboardShell>
  );
}
