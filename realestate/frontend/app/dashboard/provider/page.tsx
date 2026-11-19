"use client";

import { FileText, Star, IndianRupee, Clock, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { providerNav } from "@/lib/nav-config";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendChart } from "@/components/charts/TrendChart";
import { useApiData } from "@/lib/hooks/useApiData";
import { serviceBookingsApi } from "@/lib/api/service-bookings";
import { providersApi } from "@/lib/api/providers";
import { formatINR } from "@/lib/api/format";
import { ServiceBookingStatus } from "@/lib/api/domain-types";

const statusVariant: Record<ServiceBookingStatus, "info" | "warning" | "success" | "neutral"> = {
  NEW: "info",
  ACCEPTED: "warning",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "neutral",
};
const statusLabel: Record<ServiceBookingStatus, string> = {
  NEW: "New",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

async function loadOverview() {
  const [bookingsRes, profileRes] = await Promise.all([
    serviceBookingsApi.mineAsProvider(),
    providersApi.mine(),
  ]);
  return { bookings: bookingsRes.bookings, profile: profileRes.profile };
}

function monthlyEarnings(bookings: { status: ServiceBookingStatus; amount: number; scheduledAt: string }[]) {
  const months: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    const value = bookings
      .filter((b) => {
        if (b.status !== "COMPLETED") return false;
        const bd = new Date(b.scheduledAt);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      })
      .reduce((sum, b) => sum + b.amount, 0);
    months.push({ label, value });
  }
  return months;
}

export default function ProviderOverviewPage() {
  const { data, loading, error, reload } = useApiData(loadOverview);
  const bookings = data?.bookings ?? [];
  const profile = data?.profile ?? null;

  const now = new Date();
  const thisMonthBookings = bookings.filter((b) => {
    const d = new Date(b.scheduledAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const thisMonthEarnings = thisMonthBookings.filter((b) => b.status === "COMPLETED").reduce((s, b) => s + b.amount, 0);
  const trend = monthlyEarnings(bookings);
  const recent = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  return (
    <DashboardShell
      groups={providerNav}
      roleColor="info"
      pageTitle="Overview"
      pageSubtitle={profile ? `${profile.displayName} — ${profile.city}` : "Set up your provider profile to get started"}
    >
      {loading && <LoadingRow label="Loading your dashboard…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && !profile && (
        <EmptyState
          title="Set up your provider profile"
          description="Add your business details so seekers can find and book you on the services marketplace."
          action={<Button href="/dashboard/provider/calendar" variant="primary" size="sm">Set up profile</Button>}
        />
      )}

      {!loading && !error && profile && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Bookings this month" value={String(thisMonthBookings.length)} icon={<FileText size={16} />} />
            <StatCard label="Earnings this month" value={formatINR(thisMonthEarnings)} icon={<IndianRupee size={16} />} hint="from completed jobs" />
            <StatCard label="Rating" value={profile.ratingAvg.toFixed(1)} icon={<Star size={16} />} hint={`${profile.ratingCount} reviews`} />
            <StatCard label="Status" value={profile.verified ? "Verified" : "Pending"} icon={<Clock size={16} />} hint={profile.category.replace("_", " ")} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader eyebrow="Payouts" title="Earnings — last 6 months" />
              <TrendChart data={trend} dataKey="value" valuePrefix="₹" height={240} />
            </Card>

            <Card>
              <CardHeader
                eyebrow="Inbox"
                title="Recent bookings"
                action={
                  <Button href="/dashboard/provider/bookings" variant="ghost" size="sm" icon={<ArrowRight size={14} />}>
                    All
                  </Button>
                }
              />
              {recent.length ? (
                <ul className="space-y-3">
                  {recent.map((b) => (
                    <li key={b.id} className="rounded-xl border border-stone-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-ink-900">{b.customer?.name ?? "Customer"}</p>
                        <Badge variant={statusVariant[b.status]}>{statusLabel[b.status]}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-text-500">{b.serviceName}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-text-400">No bookings yet.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
