"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, PlusCircle } from "lucide-react";
import { SealMark } from "../ui/SealMark";
import { Button } from "../ui/Button";
import { useAuth, primaryDashboardPath } from "@/lib/auth/AuthProvider";

const links = [
  { label: "Buy", href: "/properties?intent=Buy" },
  { label: "Rent", href: "/properties?intent=Rent" },
  { label: "PG / Co-living", href: "/properties?intent=PG" },
  { label: "New Projects", href: "/projects" },
  { label: "Home Loans", href: "/home-loans" },
  { label: "Services", href: "/services" },
];

function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-1 pr-2.5 hover:bg-stone-100"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="max-w-[8rem] truncate text-sm font-medium text-ink-900">{user.name ?? user.email}</span>
        <ChevronDown size={14} className="text-text-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
          <Link
            href={primaryDashboardPath(user)}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-text-700 hover:bg-stone-50"
          >
            <LayoutDashboard size={15} /> My dashboard
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
              logout();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-danger-600 hover:bg-danger-50"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { status, user, logout } = useAuth();
  const authed = status === "authenticated" && !!user;
  const hasOwnerRole = !!user?.roles.includes("OWNER");
  const postPropertyHref = !authed ? "/register" : hasOwnerRole ? "/dashboard/owner" : "/dashboard/upgrade";

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <SealMark size={26} className="text-brass-500" />
          <span className="font-display text-xl font-medium text-ink-900">Pavitram</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-text-700 transition-colors hover:text-ink-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authed ? (
            <>
              <Button href={postPropertyHref} variant="primary" size="sm">
                Post Property — Free
              </Button>
              <AccountMenu />
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button href={postPropertyHref} variant="primary" size="sm">
                Post Property — Free
              </Button>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-700 hover:bg-stone-100"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-stone-200 pt-3">
            {authed ? (
              <>
                <Button href={primaryDashboardPath(user)} variant="outline" size="sm">
                  My dashboard
                </Button>
                <Button href={postPropertyHref} variant="primary" size="sm">
                  Post Property — Free
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setOpen(false); logout(); }}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="outline" size="sm">
                  Log in
                </Button>
                <Button href={postPropertyHref} variant="primary" size="sm">
                  Post Property — Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
