"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";
import { SealMark } from "../ui/SealMark";
import { iconMap, IconKey } from "./icons";

export type NavItem = { label: string; href: string; icon: IconKey };
export type NavGroup = { label?: string; items: NavItem[] };

export function Sidebar({
  groups,
  roleLabel,
  roleColor = "brand",
}: {
  groups: NavGroup[];
  roleLabel: string;
  roleColor?: "brand" | "brass" | "info";
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const chipColor =
    roleColor === "info"
      ? "bg-info-600/20 text-info-100"
      : "bg-brass-500/20 text-brass-200";

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-ink-800 bg-ink-900 text-stone-100 transition-all duration-200 lg:flex ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-ink-800 px-5">
        <SealMark size={22} className="shrink-0 text-brass-200" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-medium leading-tight text-white">
              Pavitram
            </p>
            <p className={`truncate rounded px-1 text-[10px] font-medium leading-tight ${chipColor}`}>
              {roleLabel}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.label && !collapsed && (
              <p className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-wider text-stone-400/70">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href + "/"));
                const Icon = iconMap[item.icon];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-white/10 text-white font-medium"
                          : "text-stone-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={17} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 border-t border-ink-800 px-5 py-3.5 text-xs text-stone-400 hover:text-white"
      >
        {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}
