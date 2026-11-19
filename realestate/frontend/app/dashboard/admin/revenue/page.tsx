import { IndianRupee, TrendingUp, Users, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PreviewBanner } from "@/components/dashboard/PreviewBanner";
import { adminNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { BarComparison } from "@/components/charts/BarComparison";
import { TrendChart } from "@/components/charts/TrendChart";
import { platformStats, mrrTrend, revenueByPlan, invoices, formatINR } from "@/lib/mock-data";

export default function AdminRevenuePage() {
  const cols: Column<(typeof invoices)[number]>[] = [
    { header: "Invoice", accessor: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { header: "Plan", accessor: (r) => r.plan },
    { header: "Amount", accessor: (r) => formatINR(r.amount + r.gst), align: "right" },
    { header: "Date", accessor: (r) => r.date },
    {
      header: "Status",
      accessor: (r) => <Badge variant={r.status === "Paid" ? "success" : "danger"}>{r.status}</Badge>,
    },
  ];

  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Revenue & subscriptions"
      pageSubtitle="Money earned, plan performance & invoices"
    >
      <PreviewBanner>
        There&apos;s no billing/invoice model on the backend yet (subscriptions track plan + credits only, with
        no payment amounts or GST). This page illustrates the intended revenue dashboard with sample figures
        until a billing provider (e.g. Razorpay) and an invoice model are added.
      </PreviewBanner>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="MRR" value={formatINR(platformStats.mrr)} delta="+4.6%" icon={<IndianRupee size={16} />} hint="vs last month" />
        <StatCard label="ARR" value={formatINR(platformStats.arr)} delta="+4.6%" icon={<TrendingUp size={16} />} hint="run-rate" />
        <StatCard label="Paying accounts" value="9,840" delta="+1.9%" icon={<Users size={16} />} hint="owners/agents/builders" />
        <StatCard label="Churn" value={`${platformStats.churn}%`} delta="-0.4pt" trend="up" icon={<RefreshCw size={16} />} hint="monthly" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader eyebrow="Trend" title="MRR — last 6 months" />
          <TrendChart data={mrrTrend} dataKey="value" valuePrefix="₹" height={260} />
        </Card>
        <Card>
          <CardHeader eyebrow="Plan mix" title="Revenue by plan" />
          <BarComparison data={revenueByPlan} dataKey="value" horizontal height={260} />
        </Card>
      </div>

      <Card className="mt-6" padded={false}>
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <CardHeader eyebrow="Billing" title="Recent invoices" subtitle="GST-compliant, auto-generated" />
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <DataTable columns={cols} data={invoices} keyField={(r) => r.id} />
        </div>
      </Card>
    </DashboardShell>
  );
}
