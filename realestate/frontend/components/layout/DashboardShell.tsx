"use client";

import { ReactNode } from "react";
import { Sidebar, NavGroup } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/lib/auth/AuthProvider";
import { RealRole } from "@/lib/auth/types";

const roleLabels: Record<RealRole, string> = {
  SEEKER: "Property Seeker",
  OWNER: "Owner / Agent / Builder",
  PROVIDER: "Service Provider",
  ADMIN: "Super Admin",
};

function initialsOf(name: string | null | undefined, fallback: string): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function DashboardShell({
  groups,
  roleLabel,
  roleColor,
  pageTitle,
  pageSubtitle,
  /** Optional overrides — by default the real signed-in user's identity is used. */
  userName,
  userMeta,
  avatarInitials,
  children,
}: {
  groups: NavGroup[];
  roleLabel?: string;
  roleColor?: "brand" | "brass" | "info";
  pageTitle: string;
  pageSubtitle?: string;
  userName?: string;
  userMeta?: string;
  avatarInitials?: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();

  const resolvedRoleLabel = roleLabel ?? (user?.roles.length ? roleLabels[user.roles[0]] : "Account");
  const resolvedName = userName ?? user?.name ?? user?.email ?? "Your account";
  const resolvedMeta = userMeta ?? (user?.roles.length ? roleLabels[user.roles[0]] : resolvedRoleLabel);
  const resolvedInitials = avatarInitials ?? initialsOf(user?.name, resolvedName.slice(0, 2).toUpperCase());

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar groups={groups} roleLabel={resolvedRoleLabel} roleColor={roleColor} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar
          title={pageTitle}
          subtitle={pageSubtitle}
          userName={resolvedName}
          userMeta={resolvedMeta}
          avatarInitials={resolvedInitials}
          onLogout={logout}
        />
        <MobileNav groups={groups} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
