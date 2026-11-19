"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Bell, ChevronRight, LogOut, Clock, ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";

export default function DashboardShell({
  title,
  subtitle,
  roleLabel,
  accent = "var(--color-gold)",
  nav,
  activeHref,
  requireRole,
  children,
}) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { auth, logout, state } = useStore();

  if (requireRole && (!auth || auth.role !== requireRole)) {
    const isCustomer = requireRole === "customer";
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-5">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-8 text-center shadow-sm">
          <span
            className="mx-auto grid h-12 w-12 place-items-center rounded-full text-xl text-white"
            style={{ background: accent }}
          >
            🔒
          </span>
          <h1 className="mt-4 font-display text-lg font-semibold text-ink">Sign in required</h1>
          <p className="mt-1 text-sm text-ink-muted">
            You need to be logged in as {roleLabel} to view this dashboard.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: accent }}
          >
            Go to Login
          </Link>
          <Link href="/" className="mt-3 block text-xs text-ink-muted hover:text-ink">
            ← Back to storefront
          </Link>
        </div>
      </div>
    );
  }

  // ---- KYC / approval gating ----
  // A vendor or business-buyer account can exist (role is set) without
  // having finished KYC (no vendorId/buyerId yet), or having finished KYC
  // but not yet been approved by admin. Neither case should be able to
  // operate the dashboard.
  let approvalGate = null;
  if (requireRole === "vendor") {
    if (!auth.vendorId) {
      approvalGate = { type: "no-kyc", href: "/vendor/register", label: "Complete store verification" };
    } else {
      const vendor = state.vendors.find((v) => v.id === auth.vendorId);
      if (vendor && vendor.status !== "Active") {
        approvalGate = { type: "pending", status: vendor.status };
      }
    }
  } else if (requireRole === "b2b") {
    if (!auth.buyerId) {
      approvalGate = { type: "no-kyc", href: "/b2b/register", label: "Complete business verification" };
    } else {
      const buyer = state.businessBuyers.find((b) => b.id === auth.buyerId);
      if (buyer && buyer.status !== "Approved") {
        approvalGate = { type: "pending", status: buyer.status };
      }
    }
  }

  if (approvalGate?.type === "no-kyc") {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-5">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-8 text-center shadow-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full text-xl text-white" style={{ background: accent }}>
            <ShieldAlert size={20} />
          </span>
          <h1 className="mt-4 font-display text-lg font-semibold text-ink">One step left</h1>
          <p className="mt-1 text-sm text-ink-muted">
            You&apos;re signed in, but you still need to submit your {roleLabel.toLowerCase()} KYC details before you can use this dashboard.
          </p>
          <Link
            href={approvalGate.href}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: accent }}
          >
            {approvalGate.label}
          </Link>
          <Link href="/" className="mt-3 block text-xs text-ink-muted hover:text-ink">
            ← Back to storefront
          </Link>
        </div>
      </div>
    );
  }

  if (approvalGate?.type === "pending") {
    const rejected = approvalGate.status === "Suspended" || approvalGate.status === "On Hold";
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-5">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-8 text-center shadow-sm">
          <span
            className="mx-auto grid h-12 w-12 place-items-center rounded-full text-xl text-white"
            style={{ background: rejected ? "var(--color-rose)" : accent }}
          >
            <Clock size={20} />
          </span>
          <h1 className="mt-4 font-display text-lg font-semibold text-ink">
            {rejected ? "Verification not approved" : "Verification pending"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {rejected
              ? `Our admin team reviewed your KYC submission and set your account status to "${approvalGate.status}". Contact support for details or to resubmit documents.`
              : "Your KYC documents are submitted and under review by our admin team. Your dashboard will unlock automatically as soon as you're approved — usually within 1–2 business days."}
          </p>
          <Link href="/" className="mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: accent }}>
            Back to storefront
          </Link>
          <button onClick={logout} className="mt-3 block w-full text-xs text-ink-muted hover:text-ink">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex w-full max-w-[1760px] gap-0 lg:gap-6 lg:px-6 lg:py-6">
        {/* Mobile top bar */}
        <div
          className="flex items-center justify-between px-4 py-3 lg:hidden"
          style={{ background: "var(--color-navy)" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-full border text-sm"
              style={{ borderColor: "var(--color-gold)", color: "var(--color-gold-light)" }}
            >
              ॐ
            </span>
            <span className="font-display text-base font-semibold text-white">Pavitram</span>
          </Link>
          <button className="rounded-lg p-2 text-white" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <aside
          className={`${open ? "block" : "hidden"} w-full shrink-0 lg:sticky lg:top-6 lg:block lg:h-[calc(100vh-3rem)] lg:w-64`}
        >
          <div
            className="flex h-full flex-col rounded-none p-5 lg:rounded-2xl"
            style={{ background: "var(--color-navy)" }}
          >
            <Link href="/" className="hidden items-center gap-2 lg:flex">
              <span
                className="grid h-9 w-9 place-items-center rounded-full border text-sm"
                style={{ borderColor: "var(--color-gold)", color: "var(--color-gold-light)" }}
              >
                ॐ
              </span>
              <span className="font-display text-lg font-semibold text-white">Pavitram</span>
            </Link>
            <div className="mt-4 rounded-xl border p-3" style={{ borderColor: "var(--color-navy-line)", background: "var(--color-navy-2)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
                {roleLabel}
              </p>
              {auth && <p className="mt-1 text-xs font-medium text-white">{auth.name}</p>}
              {subtitle && <p className="mt-1 text-xs" style={{ color: "var(--color-navy-muted)" }}>{subtitle}</p>}
            </div>

            <nav className="mt-5 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
              {(() => {
                // `nav` can be a flat array of items (old shape, still works)
                // or an array of { section, items } groups — grouping just
                // adds a small uppercase label above each set of links so a
                // long sidebar reads as "Catalog / Orders / Finance" instead
                // of one undifferentiated list.
                const groups = nav[0]?.items ? nav : [{ section: null, items: nav }];
                return groups.map((group, gi) => (
                  <div key={group.section || `g${gi}`} className={gi > 0 ? "mt-3" : ""}>
                    {group.section && (
                      <p
                        className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--color-navy-muted)" }}
                      >
                        {group.section}
                      </p>
                    )}
                    {group.items.map((item) => {
                      const active = item.href === activeHref;
                      return (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                          style={{
                            background: active ? "rgba(230,185,85,0.14)" : "transparent",
                            color: active ? "var(--color-gold-light)" : "var(--color-navy-muted)",
                            borderLeft: active ? `2px solid var(--color-gold)` : "2px solid transparent",
                          }}
                        >
                          <item.icon size={17} />
                          <span className="flex-1">{item.label}</span>
                          {active && <ChevronRight size={14} />}
                        </Link>
                      );
                    })}
                  </div>
                ));
              })()}
            </nav>

            {auth && (
              <button
                onClick={logout}
                className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium hover:text-white"
                style={{ color: "var(--color-navy-muted)" }}
              >
                <LogOut size={16} /> Sign out
              </button>
            )}
            <Link
              href="/"
              className="mt-1 block rounded-lg px-3 py-2 text-xs font-medium hover:text-white"
              style={{ color: "var(--color-navy-muted)" }}
            >
              ← Back to storefront
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-0 lg:py-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  className="grid h-9 w-9 place-items-center rounded-full border border-line bg-paper-raised text-ink-muted hover:text-ink"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((v) => !v)}
                >
                  <Bell size={16} />
                  {state.activityLogs.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-rose)" }} />
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 top-11 z-20 max-h-80 w-72 overflow-y-auto rounded-xl border border-line bg-paper-raised p-2 shadow-lg">
                      <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Recent activity</p>
                      {state.activityLogs.slice(0, 8).map((l) => (
                        <div key={l.id} className="rounded-lg px-2 py-2 text-xs hover:bg-paper">
                          <p className="text-ink">{l.action}</p>
                          <p className="mt-0.5 text-[10px] text-ink-muted">{l.actor} · {l.time}</p>
                        </div>
                      ))}
                      {state.activityLogs.length === 0 && <p className="px-2 py-3 text-xs text-ink-muted">No activity yet.</p>}
                    </div>
                  </>
                )}
              </div>
              <span
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: accent }}
              >
                {roleLabel}
              </span>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
