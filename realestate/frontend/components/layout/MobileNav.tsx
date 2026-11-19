"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavGroup } from "./Sidebar";
import { iconMap } from "./icons";

export function MobileNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const items = groups.flatMap((g) => g.items);

  return (
    <div className="flex gap-1.5 overflow-x-auto border-b border-stone-200 bg-white px-4 py-2.5 lg:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
        const Icon = iconMap[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              active ? "bg-ink-900 text-white" : "bg-stone-100 text-text-600"
            }`}
          >
            <Icon size={13} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
