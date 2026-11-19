"use client";

import { Search, LogOut, User as UserIcon, ChevronDown, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { NotificationBell } from "./NotificationBell";

export function Topbar({
  title,
  subtitle,
  userName,
  userMeta,
  avatarInitials,
  onLogout,
}: {
  title: string;
  subtitle?: string;
  userName: string;
  userMeta: string;
  avatarInitials: string;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-stone-200 bg-stone-50/90 px-5 backdrop-blur sm:px-8">
      <div className="min-w-0">
        <h1 className="truncate font-display text-lg font-medium text-ink-900">{title}</h1>
        {subtitle && <p className="truncate text-xs text-text-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-text-400 md:flex">
          <Search size={15} />
          <span className="hidden lg:inline">Search…</span>
        </div>
        <NotificationBell />

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Account menu"
            className="flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-1 pr-2.5 hover:bg-stone-100"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {avatarInitials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-[9rem] truncate text-xs font-medium leading-tight text-ink-900">{userName}</span>
              <span className="block max-w-[9rem] truncate text-[11px] leading-tight text-text-400">{userMeta}</span>
            </span>
            <ChevronDown size={14} className="hidden text-text-400 sm:block" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-text-700 hover:bg-stone-50"
              >
                <UserIcon size={15} /> View public site
              </Link>
              <Link
                href="/dashboard/upgrade"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-text-700 hover:bg-stone-50"
              >
                <PlusCircle size={15} /> Add a role
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout?.();
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-danger-600 hover:bg-danger-50"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
