"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, MessageSquare, Layers, Clock } from "lucide-react";
import { adminApi, type AdminDashboardStats } from "@/lib/admin/api";
import { AdminCard, AdminBadge } from "@/components/admin/admin-ui";

function StatCard({ label, value, icon: Icon, href }: { label: string; value: number | string; icon: any; href?: string }) {
  const content = (
    <AdminCard className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-mist">{label}</p>
          <p className="mt-1.5 font-display text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#FDF3E0] text-gold">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </AdminCard>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setStats)
      .catch((e) => setError(e.message || "Failed to load dashboard"));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-mist">Overview of Pavitram India's live content and members.</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {!stats && !error && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {stats && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={stats.users.total} icon={Users} href="/super-admin/users" />
            <StatCard
              label="Pending Join Requests"
              value={stats.community.pending}
              icon={UserPlus}
              href="/super-admin/community"
            />
            <StatCard
              label="Unread Messages"
              value={stats.messages.unread}
              icon={MessageSquare}
              href="/super-admin/messages"
            />
            <StatCard
              label="Published Services"
              value={`${stats.content.services.published}/${stats.content.services.total}`}
              icon={Layers}
              href="/super-admin/services"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <AdminCard className="p-5">
              <h2 className="font-display text-lg font-bold text-ink">Recent Join Requests</h2>
              <div className="mt-4 space-y-3">
                {stats.recent.community.length === 0 && (
                  <p className="text-sm text-mist">No submissions yet.</p>
                )}
                {stats.recent.community.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between border-b border-ink/6 pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-ink">{c.fullName}</p>
                      <p className="text-xs text-mist">
                        {c.organization} · {c.city}
                      </p>
                    </div>
                    <AdminBadge tone={c.status === "PENDING" ? "warning" : c.status === "APPROVED" ? "success" : "danger"}>
                      {c.status}
                    </AdminBadge>
                  </div>
                ))}
              </div>
              <Link href="/super-admin/community" className="mt-4 inline-block text-xs font-semibold text-gold hover:underline">
                View all →
              </Link>
            </AdminCard>

            <AdminCard className="p-5">
              <h2 className="font-display text-lg font-bold text-ink">Recent Messages</h2>
              <div className="mt-4 space-y-3">
                {stats.recent.messages.length === 0 && <p className="text-sm text-mist">No messages yet.</p>}
                {stats.recent.messages.map((m: any) => (
                  <div key={m.id} className="border-b border-ink/6 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">{m.name}</p>
                      <AdminBadge tone={m.status === "NEW" ? "gold" : "default"}>{m.status}</AdminBadge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-mist">{m.subject}</p>
                  </div>
                ))}
              </div>
              <Link href="/super-admin/messages" className="mt-4 inline-block text-xs font-semibold text-gold hover:underline">
                View all →
              </Link>
            </AdminCard>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-mist">
            <Clock className="h-3.5 w-3.5" /> {stats.users.newLast30Days} new users in the last 30 days
          </div>
        </>
      )}
    </div>
  );
}
