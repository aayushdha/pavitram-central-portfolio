"use client";

import { IndianRupee, Wallet, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { providerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendChart } from "@/components/charts/TrendChart";
import { useApiData } from "@/lib/hooks/useApiData";
import { serviceBookingsApi } from "@/lib/api/service-bookings";
import { formatINR } from "@/lib/api/format";
import { ServiceBooking } from "@/lib/api/domain-types";

function monthlyEarnings(bookings: ServiceBooking[]) {
  const months: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = bookings
      .filter((b) => b.status === "COMPLETED")
      .filter((b) => {
        const bd = new Date(b.scheduledAt);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      })
      .reduce((sum, b) => sum + b.amount, 0);
    months.push({ label: d.toLocaleDateString("en-IN", { month: "short" }), value });
  }
  return months;
}

export default function ProviderEarningsPage() {
  const { data, loading, error, reload } = useApiData(() => serviceBookingsApi.mineAsProvider());
  const bookings = data?.bookings ?? [];
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const trend = monthlyEarnings(bookings);
  const totalEarned = completed.reduce((s, b) => s + b.amount, 0);
  const thisMonth = trend[trend.length - 1]?.value ?? 0;

  const cols: Column<ServiceBooking>[] = [
    { header: "Booking", accessor: (r) => <span className="font-mono text-xs">{r.id.slice(0, 8)}</span> },
    { header: "Customer", accessor: (r) => r.customer?.name ?? "Customer" },
    { header: "Service", accessor: (r) => r.serviceName },
    { header: "Amount", accessor: (r) => <span className="font-medium text-brand-700">{formatINR(r.amount)}</span>, align: "right" },
    { header: "Status", accessor: () => <Badge variant="success">Completed</Badge> },
  ];

  return (
    <DashboardShell
      groups={providerNav}
      roleColor="info"
      pageTitle="Earnings & payouts"
      pageSubtitle="What you've earned from completed bookings"
    >
      {loading && <LoadingRow label="Loading your earnings…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="This month" value={formatINR(thisMonth)} icon={<IndianRupee size={16} />} />
            <StatCard label="Total earned" value={formatINR(totalEarned)} icon={<Wallet size={16} />} hint="all-time, completed jobs" />
            <StatCard label="Completed jobs" value={String(completed.length)} icon={<TrendingUp size={16} />} />
            <StatCard label="Payouts" value="Not wired up" hint="needs a billing provider" />
          </div>

          <Card className="mt-6">
            <CardHeader eyebrow="Trend" title="Earnings — last 6 months" />
            <TrendChart data={trend} dataKey="value" valuePrefix="₹" height={240} />
          </Card>

          <Card className="mt-6" padded={false}>
            <div className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardHeader
                eyebrow="Ledger"
                title="Completed bookings"
                subtitle="Commission and automated payouts aren't wired up yet — this needs a billing provider (e.g. Razorpay) and a payout model on the backend."
              />
            </div>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              {completed.length ? (
                <DataTable columns={cols} data={completed} keyField={(r) => r.id} />
              ) : (
                <EmptyState title="No completed bookings yet" description="Completed jobs will appear here with their payout amount." />
              )}
            </div>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
