"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Search, Building2, User, LogOut, Heart } from "lucide-react";
import { useStore } from "@/lib/store";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#trade-types", label: "B2B, B2C & D2C" },
];

const dashboardHref = {
  admin: "/admin/dashboard",
  vendor: "/vendor/dashboard",
  b2b: "/b2b/dashboard",
  customer: "/account",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { state, auth, logout } = useStore();
  const cartCount = state.cart.reduce((sum, c) => sum + c.qty, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 border-b transition-colors"
      style={{
        background: scrolled ? "var(--color-navy)" : "rgba(10,15,30,0.94)",
        borderColor: "var(--color-navy-line)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-5 py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold"
            style={{ borderColor: "var(--color-gold)", color: "var(--color-gold-light)" }}
          >
            ॐ
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            Pavitram
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:text-white"
              style={{ color: "var(--color-navy-muted)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/products"
            className="hidden rounded-full p-2 hover:text-white sm:block"
            style={{ color: "var(--color-navy-muted)" }}
            aria-label="Search"
          >
            <Search size={19} />
          </Link>
          <Link
            href="/wishlist"
            className="relative hidden rounded-full p-2 hover:text-white sm:block"
            style={{ color: "var(--color-navy-muted)" }}
            aria-label="Wishlist"
          >
            <Heart size={19} />
            {state.wishlist.length > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-semibold text-white"
                style={{ background: "var(--color-rose)" }}
              >
                {state.wishlist.length}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 hover:text-white"
            style={{ color: "var(--color-navy-muted)" }}
            aria-label="Cart"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-semibold text-white"
                style={{ background: "var(--color-gold)" }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {auth ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium hover:text-white"
                style={{ borderColor: "var(--color-navy-line)", color: "var(--color-navy-muted)" }}
              >
                <User size={15} /> {auth.name.split(" ")[0]}
              </button>
              {menu && (
                <div className="absolute right-0 top-11 w-52 rounded-xl border border-line bg-paper-raised p-1.5 shadow-lg">
                  <p className="px-3 py-1.5 text-xs text-ink-muted">
                    Signed in as <span className="font-semibold text-ink">{auth.role}</span>
                  </p>
                  <Link
                    href={dashboardHref[auth.role] || "/"}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-paper"
                    onClick={() => setMenu(false)}
                  >
                    Go to dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink hover:bg-paper"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium hover:text-white sm:block"
                style={{ color: "var(--color-navy-muted)" }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="hidden items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold sm:inline-flex"
                style={{ background: "#ffffff", color: "var(--color-navy)" }}
              >
                Sign up
              </Link>
            </>
          )}

          {(!auth || auth.role === "customer") && (
            <Link
              href="/business/signup"
              className="hidden items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold sm:inline-flex"
              style={{ borderColor: "var(--color-gold)", color: "var(--color-gold-light)" }}
            >
              <Building2 size={15} />
              Sell / Buy in Bulk
            </Link>
          )}

          <button
            className="rounded-full p-2 text-white md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t px-5 py-4 md:hidden" style={{ borderColor: "var(--color-navy-line)" }}>
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-2 py-2 text-sm font-medium text-white hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--color-navy-line)" }}>
            {auth ? (
              <>
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-navy-muted)" }}>
                  Signed in as {auth.name} ({auth.role})
                </p>
                <Link
                  href={dashboardHref[auth.role] || "/"}
                  className="rounded-lg px-2 py-2 text-sm font-medium text-white hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  Go to dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="rounded-full px-4 py-2.5 text-center text-sm font-semibold"
                  style={{ background: "#ffffff", color: "var(--color-navy)" }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-navy-muted)" }}>
                  Shopping on Pavitram
                </p>
                <Link
                  href="/login"
                  className="rounded-lg px-2 py-2 text-sm font-medium text-white hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full px-4 py-2.5 text-center text-sm font-semibold"
                  style={{ background: "#ffffff", color: "var(--color-navy)" }}
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--color-navy-line)" }}>
            {(!auth || auth.role === "customer") && (
              <>
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-navy-muted)" }}>
                  Selling or buying in bulk
                </p>
                <Link
                  href="/business/signup"
                  className="flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold"
                  style={{ borderColor: "var(--color-gold)", color: "var(--color-gold-light)" }}
                  onClick={() => setOpen(false)}
                >
                  <Building2 size={15} />
                  Sell / Buy in Bulk
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
